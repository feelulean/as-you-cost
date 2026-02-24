/**
 * YHJY As-You-Cost — Polymer 1.x Shim (v3 – dom-if / computed expression 지원)
 *
 * ── 핵심 설계 ──
 * 1. {{path}} / [[path]] 바인딩 디스크립터를 수집·적용한다.
 * 2. 함수 호출 표현식 지원: {{_isTab(activeTab,'manager')}} 등
 * 3. <template is="dom-if"> 조건부 렌더링 지원 (stamp-all, show/hide)
 * 4. class$ → class 등 Polymer attribute$ 바인딩 매핑
 * 5. sc-* 커스텀 엘리먼트는 자체 이벤트 처리, 네이티브만 shim 이벤트 바인딩.
 * 6. this.$, this.$$, this.set() 지원.
 */
(function (global) {
  'use strict';

  /* ──────────────────────────────────────────────
     1. dom-module 레지스트리
     ────────────────────────────────────────────── */
  var _modules = {};

  function registerDomModule(el) {
    var id = el.getAttribute('id');
    if (id) _modules[id] = el;
  }

  function collectExistingModules() {
    var mods = document.querySelectorAll('dom-module');
    for (var i = 0; i < mods.length; i++) registerDomModule(mods[i]);
  }

  /* ──────────────────────────────────────────────
     2. 경로 유틸 + 표현식 해석기
     ────────────────────────────────────────────── */
  function getByPath(obj, path) {
    if (!path) return undefined;
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function setByPath(obj, path, value) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  /**
   * 함수 호출 인자 문자열을 분할한다 (문자열 리터럴 내 콤마 안전).
   * "_isTab(activeTab,'manager')" → ["activeTab", "'manager'"]
   */
  function splitArgs(argStr) {
    var args = [];
    var depth = 0;
    var inStr = false;
    var strCh = '';
    var cur = '';
    for (var i = 0; i < argStr.length; i++) {
      var ch = argStr[i];
      if (inStr) {
        cur += ch;
        if (ch === strCh) inStr = false;
      } else if (ch === "'" || ch === '"') {
        inStr = true;
        strCh = ch;
        cur += ch;
      } else if (ch === '(') {
        depth++;
        cur += ch;
      } else if (ch === ')') {
        depth--;
        cur += ch;
      } else if (ch === ',' && depth === 0) {
        args.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
  }

  /**
   * 표현식을 해석하여 값을 반환한다.
   * - 단순 경로: "searchParam.bizUnit" → getByPath
   * - 함수 호출: "_isTab(activeTab,'manager')" → ctx._isTab(...)
   * - 부정: "!someVal" → !resolveExpression(...)
   */
  function resolveExpression(ctx, expr) {
    expr = expr.trim();
    /* 부정 연산자 */
    if (expr.charAt(0) === '!') {
      return !resolveExpression(ctx, expr.substring(1));
    }
    /* 함수 호출: funcName(args...) */
    var funcMatch = expr.match(/^(\w+)\((.+)\)$/);
    if (funcMatch) {
      var funcName = funcMatch[1];
      var func = ctx[funcName];
      if (typeof func === 'function') {
        var rawArgs = splitArgs(funcMatch[2]);
        var resolvedArgs = [];
        for (var i = 0; i < rawArgs.length; i++) {
          var a = rawArgs[i].trim();
          if ((a.charAt(0) === "'" && a.charAt(a.length - 1) === "'") ||
              (a.charAt(0) === '"' && a.charAt(a.length - 1) === '"')) {
            resolvedArgs.push(a.substring(1, a.length - 1));
          } else {
            resolvedArgs.push(getByPath(ctx, a));
          }
        }
        return func.apply(ctx, resolvedArgs);
      }
    }
    /* 단순 함수 호출 (인자 없음): funcName() */
    var noArgMatch = expr.match(/^(\w+)\(\)$/);
    if (noArgMatch && typeof ctx[noArgMatch[1]] === 'function') {
      return ctx[noArgMatch[1]].call(ctx);
    }
    /* 단순 경로 */
    return getByPath(ctx, expr);
  }

  /**
   * 표현식에서 참조하는 프로퍼티 경로들을 추출한다 (의존성 추적용).
   */
  function extractDeps(expr) {
    expr = expr.trim();
    if (expr.charAt(0) === '!') expr = expr.substring(1).trim();
    var funcMatch = expr.match(/^(\w+)\((.+)\)$/);
    if (funcMatch) {
      var rawArgs = splitArgs(funcMatch[2]);
      var deps = [];
      for (var i = 0; i < rawArgs.length; i++) {
        var a = rawArgs[i].trim();
        /* 문자열 리터럴은 의존성 아님 */
        if ((a.charAt(0) === "'" || a.charAt(0) === '"')) continue;
        deps.push(a);
      }
      return deps;
    }
    /* 단순 경로 */
    if (expr && !expr.match(/^(\w+)\(\)$/)) {
      return [expr];
    }
    return [];
  }

  /* ──────────────────────────────────────────────
     3. 바인딩 메타데이터 수집
     ────────────────────────────────────────────── */
  /* {{expr}} 또는 [[expr]] — test() 전에 lastIndex 리셋 필수 */
  var BIND_RE = /\{\{([^}]+)\}\}|\[\[([^\]]+)\]\]/g;

  function testBind(str) {
    BIND_RE.lastIndex = 0;
    return BIND_RE.test(str);
  }

  function collectBindings(root) {
    var bindings = [];

    /* 속성 바인딩 */
    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      /* dom-if 래퍼 내부의 숨겨진 콘텐츠도 포함 */
      var attrs = el.attributes;
      for (var j = 0; j < attrs.length; j++) {
        var attr = attrs[j];
        if (testBind(attr.value)) {
          var template = attr.value;
          var paths = [];
          BIND_RE.lastIndex = 0;
          template.replace(BIND_RE, function (_, g1, g2) {
            var expr = (g1 || g2).trim();
            paths.push(expr);
            /* 의존 경로도 추가 (함수 호출의 인자 경로) */
            var deps = extractDeps(expr);
            for (var d = 0; d < deps.length; d++) {
              if (paths.indexOf(deps[d]) < 0) paths.push(deps[d]);
            }
          });
          bindings.push({
            type: 'attr',
            element: el,
            attrName: attr.name.replace(/\$$/, ''),  /* class$ → class */
            rawAttrName: attr.name,
            template: template,
            paths: paths
          });
          attr.value = '';
        }
      }
    }

    /* 텍스트 노드 바인딩 */
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (testBind(node.textContent)) {
        var tpl = node.textContent;
        var tpaths = [];
        BIND_RE.lastIndex = 0;
        tpl.replace(BIND_RE, function (_, g1, g2) {
          var expr = (g1 || g2).trim();
          tpaths.push(expr);
          var deps = extractDeps(expr);
          for (var d = 0; d < deps.length; d++) {
            if (tpaths.indexOf(deps[d]) < 0) tpaths.push(deps[d]);
          }
        });
        bindings.push({
          type: 'text',
          element: node,
          template: tpl,
          paths: tpaths
        });
        node.textContent = '';
      }
    }

    return bindings;
  }

  /* ──────────────────────────────────────────────
     4. 바인딩 적용 (디스크립터 기반)
     ────────────────────────────────────────────── */
  function applyBindings(bindings, ctx, changedPath) {
    for (var i = 0; i < bindings.length; i++) {
      var b = bindings[i];

      if (changedPath) {
        var related = false;
        for (var p = 0; p < b.paths.length; p++) {
          if (isPathRelated(b.paths[p], changedPath)) {
            related = true;
            break;
          }
        }
        if (!related) {
          /* 함수 호출 표현식의 인자가 모두 문자열 리터럴인 경우
             내부 호스트 상태(예: activeDetailTab)에 의존할 수 있으므로 재평가 */
          var hasImplicitDeps = false;
          for (var q = 0; q < b.paths.length; q++) {
            if (/^\w+\(/.test(b.paths[q]) && extractDeps(b.paths[q]).length === 0) {
              hasImplicitDeps = true; break;
            }
          }
          if (!hasImplicitDeps) continue;
        }
      }

      BIND_RE.lastIndex = 0;
      var resolved = b.template.replace(BIND_RE, function (_, g1, g2) {
        var expr = (g1 || g2).trim();
        var v = resolveExpression(ctx, expr);
        return v == null ? '' : v;
      });

      if (b.type === 'text') {
        b.element.textContent = resolved;
      } else if (b.type === 'attr') {
        applyAttrBinding(b, resolved, ctx);
      }
    }
  }

  function isPathRelated(bindPath, changedPath) {
    return bindPath === changedPath ||
           bindPath.indexOf(changedPath + '.') === 0 ||
           changedPath.indexOf(bindPath + '.') === 0;
  }

  function applyAttrBinding(binding, resolvedValue, ctx) {
    var el = binding.element;
    var attrName = binding.attrName;    /* class$ → class 이미 매핑됨 */
    var tag = el.tagName.toLowerCase();

    /* ── sc-grid data-provider ── */
    if (tag === 'sc-grid' && attrName === 'data-provider') {
      var path = binding.paths[0];
      var data = resolveExpression(ctx, path);
      if (Array.isArray(data) && typeof el.setDataProvider === 'function') {
        el.setDataProvider(data);
      }
      return;
    }

    /* ── sc-ajax body ── */
    if (tag === 'sc-ajax' && attrName === 'body') {
      el._bodyPath = binding.paths[0];
      el._polymerHost = ctx;
      return;
    }

    /* ── sc-combobox-field items ── */
    if (tag === 'sc-combobox-field' && attrName === 'items') {
      var itemPath = binding.paths[0];
      var items = resolveExpression(ctx, itemPath);
      if (Array.isArray(items) && typeof el.setItems === 'function') {
        el.setItems(items);
      }
      return;
    }

    /* ── sc-combobox-column items ── */
    if (tag === 'sc-combobox-column' && attrName === 'items') {
      /* 컬럼 정의 요소의 items 경로를 저장 → sc-grid 렌더링 시 참조 */
      el._itemsPath = binding.paths[0];
      el._polymerHost = ctx;
      /* 비동기 코드 로딩 후 부모 sc-grid 에 combo items 갱신 통지 */
      var parentGrid = el.closest('sc-grid');
      if (parentGrid && typeof parentGrid._refreshComboItems === 'function' && parentGrid._columns) {
        parentGrid._refreshComboItems();
        parentGrid._render();
      }
      return;
    }

    /* ── 양방향 바인딩 필드 value ── */
    if (attrName === 'value' && (
        tag === 'sc-text-field' || tag === 'sc-combobox-field' ||
        tag === 'sc-number-field' || tag === 'sc-datepicker' ||
        tag === 'sc-date-field')) {
      el._valuePath = binding.paths[0];
      el._polymerHost = ctx;
      var val = resolveExpression(ctx, binding.paths[0]);
      if (typeof el.setValue === 'function') {
        el.setValue(val == null ? '' : val);
      }
      return;
    }

    /* ── 일반 속성 ── */
    el.setAttribute(attrName, resolvedValue);
    if (attrName === 'value' && 'value' in el) {
      el.value = resolvedValue;
    }
    /* class 속성 특수 처리 (class$ 바인딩 시) */
    if (attrName === 'class' && binding.rawAttrName === 'class$') {
      el.className = resolvedValue;
    }
  }

  /* ──────────────────────────────────────────────
     5. 이벤트 바인딩 (네이티브 HTML 요소만)
     ────────────────────────────────────────────── */
  var SC_TAGS = [
    'sc-ajax', 'sc-grid', 'sc-search-container', 'sc-panel',
    'sc-toolbar', 'sc-button', 'sc-label', 'sc-text-field',
    'sc-combobox-field', 'sc-number-field', 'sc-datepicker',
    'sc-data-column', 'sc-combobox-column', 'sc-checkbox-column',
    'sc-image-column', 'sc-group-column', 'sc-grid-columns',
    'sc-grid-fields', 'sc-grid-field'
  ];

  function isScElement(el) {
    return SC_TAGS.indexOf(el.tagName.toLowerCase()) >= 0 ||
           el.tagName.toLowerCase().indexOf('sc-') === 0;
  }

  function bindEvents(root, ctx) {
    var all = root.querySelectorAll('*');
    var boundCount = 0;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el._polyBound) continue;

      if (isScElement(el)) {
        el._polyBound = true;
        continue;
      }

      /* 속성을 배열로 복사 (collectBindings 의 attr.value='' 로 인한 라이브 컬렉션 이슈 방지) */
      var attrList = [];
      for (var j = 0; j < el.attributes.length; j++) {
        attrList.push({ name: el.attributes[j].name, value: el.attributes[j].value });
      }
      for (var k = 0; k < attrList.length; k++) {
        var aName = attrList[k].name;
        var aValue = attrList[k].value;
        if (aName.indexOf('on-') === 0 && aValue) {
          var evtName = aName.substring(3);
          var methodName = aValue;
          if (typeof ctx[methodName] === 'function') {
            (function (mn, en) {
              el.addEventListener(en, function (e) {
                try { ctx[mn](e); } catch (err) {
                  console.error('[polymer-shim] 이벤트 핸들러 오류:', mn, err);
                }
              });
            })(methodName, evtName);
            boundCount++;
          }
        }
      }
      el._polyBound = true;
    }
    if (boundCount > 0) {
      console.log('[polymer-shim] bindEvents: ' + boundCount + '개 이벤트 바인딩 완료');
    }
  }

  /* ──────────────────────────────────────────────
     6. this.$ 매핑
     ────────────────────────────────────────────── */
  function buildDollarMap(root) {
    var map = {};
    var els = root.querySelectorAll('[id]');
    for (var i = 0; i < els.length; i++) {
      map[els[i].id] = els[i];
    }
    return map;
  }

  /* ──────────────────────────────────────────────
     7. dom-if 처리 — stamp-all + show/hide
     ────────────────────────────────────────────── */

  /**
   * 호스트 내의 모든 <template is="dom-if"> 를 찾아
   * 콘텐츠를 wrapper <div> 에 stamp 하고,
   * 조건(if 속성)에 따라 show/hide 한다.
   *
   * @returns {Array} dom-if 디스크립터 배열
   *   [{ wrapper: HTMLElement, condExpr: string, deps: string[] }]
   */
  function processDomIf(host) {
    var descriptors = [];

    /* 반복 처리 (중첩 dom-if 포함, 최대 50회 안전장치) */
    var changed = true;
    var maxIter = 50;
    while (changed && maxIter-- > 0) {
      changed = false;
      var templates = host.querySelectorAll('template[is="dom-if"]');
      for (var i = 0; i < templates.length; i++) {
        var tpl = templates[i];
        var ifAttr = tpl.getAttribute('if') || '';

        /* {{expr}} 또는 [[expr]] 에서 표현식 추출 */
        var condExpr = '';
        BIND_RE.lastIndex = 0;
        var m = BIND_RE.exec(ifAttr);
        if (m) {
          condExpr = (m[1] || m[2]).trim();
        }

        /* wrapper div 생성 */
        var wrapper = document.createElement('div');
        wrapper.className = '_dom-if-wrapper';
        wrapper.style.display = 'none';  /* 초기에는 숨김 */

        /* template content 를 wrapper 로 이동 */
        var content = document.importNode(tpl.content, true);
        wrapper.appendChild(content);

        /* template 을 wrapper 로 교체 */
        tpl.parentNode.replaceChild(wrapper, tpl);

        descriptors.push({
          wrapper: wrapper,
          condExpr: condExpr,
          deps: extractDeps(condExpr)
        });

        changed = true;
      }
    }

    return descriptors;
  }

  /**
   * dom-if 조건을 재평가하여 wrapper 를 show/hide 한다.
   * changedPath 가 null 이면 전체 평가.
   */
  function evaluateDomIfs(domIfs, ctx, changedPath) {
    for (var i = 0; i < domIfs.length; i++) {
      var d = domIfs[i];
      /* changedPath 가 지정되면 관련 조건만 평가 */
      if (changedPath) {
        var related = false;
        for (var k = 0; k < d.deps.length; k++) {
          if (isPathRelated(d.deps[k], changedPath)) {
            related = true;
            break;
          }
        }
        /* 의존 경로가 비어있어도 호스트 내부 상태에 의존할 수 있으므로 재평가 */
        if (!related && d.deps.length > 0) continue;
      }

      var show = !!resolveExpression(ctx, d.condExpr);
      var wasHidden = d.wrapper.style.display === 'none';
      d.wrapper.style.display = show ? '' : 'none';

      /* 숨김→표시 전환 시 내부 그리드 강제 리프레시 */
      if (show && wasHidden) {
        var grids = d.wrapper.querySelectorAll('sc-grid');
        for (var g = 0; g < grids.length; g++) {
          if (typeof grids[g]._parseColumns === 'function') {
            grids[g]._parseColumns();
            grids[g]._render();
          }
        }
      }
    }
  }

  /* ──────────────────────────────────────────────
     8. dom-repeat 처리 (기본 지원)
     ────────────────────────────────────────────── */
  function processDomRepeat(host) {
    var descriptors = [];
    var templates = host.querySelectorAll('template[is="dom-repeat"]');
    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      var itemsAttr = tpl.getAttribute('items') || '';
      BIND_RE.lastIndex = 0;
      var m = BIND_RE.exec(itemsAttr);
      var itemsPath = m ? (m[1] || m[2]).trim() : '';

      var container = document.createElement('div');
      container.className = '_dom-repeat-container';

      tpl.parentNode.replaceChild(container, tpl);

      descriptors.push({
        container: container,
        template: tpl,
        itemsPath: itemsPath
      });
    }
    return descriptors;
  }

  function evaluateDomRepeats(repeats, ctx, changedPath) {
    for (var i = 0; i < repeats.length; i++) {
      var r = repeats[i];
      if (changedPath && !isPathRelated(r.itemsPath, changedPath)) continue;

      var items = resolveExpression(ctx, r.itemsPath);
      if (!Array.isArray(items)) continue;

      /* 기존 콘텐츠 제거 */
      r.container.innerHTML = '';

      /* 각 항목에 대해 템플릿 stamp */
      for (var j = 0; j < items.length; j++) {
        var content = document.importNode(r.template.content, true);
        /* item 바인딩: 텍스트 노드와 속성에서 item.xxx 를 치환 */
        var allEls = content.querySelectorAll('*');
        for (var e = 0; e < allEls.length; e++) {
          var el = allEls[e];
          for (var a = 0; a < el.attributes.length; a++) {
            var attr = el.attributes[a];
            if (testBind(attr.value)) {
              BIND_RE.lastIndex = 0;
              attr.value = attr.value.replace(BIND_RE, function(_, g1, g2) {
                var expr = (g1 || g2).trim();
                if (expr === 'item' || expr.indexOf('item.') === 0) {
                  var itemPath = expr === 'item' ? '' : expr.substring(5);
                  var val = itemPath ? getByPath(items[j], itemPath) : items[j];
                  return val == null ? '' : val;
                }
                return resolveExpression(ctx, expr);
              });
            }
          }
        }
        var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
          if (testBind(node.textContent)) {
            BIND_RE.lastIndex = 0;
            node.textContent = node.textContent.replace(BIND_RE, function(_, g1, g2) {
              var expr = (g1 || g2).trim();
              if (expr === 'item' || expr.indexOf('item.') === 0) {
                var itemPath = expr === 'item' ? '' : expr.substring(5);
                var val = itemPath ? getByPath(items[j], itemPath) : items[j];
                return val == null ? '' : val;
              }
              return resolveExpression(ctx, expr);
            });
          }
        }
        r.container.appendChild(content);
      }
    }
  }

  /* ──────────────────────────────────────────────
     9. Polymer() — 메인 등록 함수
     ────────────────────────────────────────────── */
  function Polymer(proto) {
    var tagName = proto.is;
    if (!tagName) { console.warn('[Polymer-shim] "is" 필수'); return; }

    function initProperties(inst) {
      var props = proto.properties || {};
      for (var key in props) {
        if (!props.hasOwnProperty(key)) continue;
        var def = props[key];
        if (typeof def.value === 'function') {
          inst[key] = def.value();
        } else if (def.value !== undefined) {
          inst[key] = def.value;
        } else {
          inst[key] = undefined;
        }
      }
    }

    function copyMethods(inst) {
      for (var key in proto) {
        if (!proto.hasOwnProperty(key)) continue;
        if (key === 'is' || key === 'properties') continue;
        if (typeof proto[key] === 'function') {
          inst[key] = proto[key].bind(inst);
        }
      }
    }

    var Ctor = function () { return Reflect.construct(HTMLElement, [], Ctor); };
    Object.setPrototypeOf(Ctor.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(Ctor, HTMLElement);

    Ctor.prototype.connectedCallback = function () {
      var me = this;
      me._isPolymerHost = true;

      initProperties(me);
      copyMethods(me);

      /* dom-module 템플릿 stamping */
      var mod = _modules[tagName];
      if (mod) {
        var tpl = mod.querySelector('template');
        if (tpl) {
          var content = document.importNode(tpl.content, true);
          me.appendChild(content);
        }
      }

      /* ★ dom-if 처리: template 을 wrapper div 로 교체 (콘텐츠를 DOM에 stamp) */
      me._domIfs = processDomIf(me);

      /* ★ dom-repeat 처리 */
      me._domRepeats = processDomRepeat(me);

      /* this.$ 구축 (dom-if 콘텐츠 포함) */
      me.$ = buildDollarMap(me);

      /* this.$$ — querySelector 폴백 */
      me.$$ = function (selector) {
        return me.querySelector(selector);
      };

      /* ★ Event Delegation — on-xxx 속성 이벤트를 호스트 레벨에서 위임 처리
         (개별 addEventListener 대신 이벤트 버블링을 활용하여 동적으로 핸들러 탐색) */
      var _delegateEvents = ['click', 'dblclick', 'change', 'input'];
      for (var _ei = 0; _ei < _delegateEvents.length; _ei++) {
        (function (evtType) {
          me.addEventListener(evtType, function (e) {
            var target = e.target;
            var attrName = 'on-' + evtType;
            while (target && target !== me) {
              if (!isScElement(target)) {
                var handlerName = target.getAttribute(attrName);
                if (handlerName && typeof me[handlerName] === 'function') {
                  try {
                    me[handlerName]({
                      target: e.target,
                      currentTarget: target,
                      detail: e.detail || {},
                      preventDefault: function () { e.preventDefault(); },
                      stopPropagation: function () { e.stopPropagation(); }
                    });
                  } catch (err) {
                    console.error('[polymer-shim] 이벤트 핸들러 오류:', handlerName, err);
                  }
                  return;
                }
              }
              target = target.parentElement;
            }
          });
        })(_delegateEvents[_ei]);
      }

      /* sc-* 컴포넌트에 호스트 참조 주입 */
      var scEls = me.querySelectorAll('*');
      for (var i = 0; i < scEls.length; i++) {
        if (isScElement(scEls[i])) {
          scEls[i]._polymerHost = me;
        }
      }

      /* 바인딩 메타데이터 수집 (dom-if 콘텐츠 포함) */
      me._bindings = collectBindings(me);

      /* this.set() — path 기반 값 설정 + 스마트 업데이트 */
      me.set = function (path, value) {
        setByPath(me, path, value);
        applyBindings(me._bindings, me, path);
        /* dom-if 조건 재평가 */
        evaluateDomIfs(me._domIfs, me, path);
        /* dom-repeat 재평가 */
        evaluateDomRepeats(me._domRepeats, me, path);
      };

      /* 초기 바인딩 적용 (전체) */
      applyBindings(me._bindings, me, null);

      /* ★ dom-if 초기 조건 평가 (초기 visible 탭 표시) */
      evaluateDomIfs(me._domIfs, me, null);

      /* ★ dom-repeat 초기 평가 */
      evaluateDomRepeats(me._domRepeats, me, null);

      /* attached() 라이프사이클 */
      if (typeof me.attached === 'function') {
        setTimeout(function () {
          try { me.attached(); } catch (err) {
            console.error('[polymer-shim] attached() 오류:', tagName, err);
          }
        }, 0);
      }
    };

    if (!customElements.get(tagName)) {
      customElements.define(tagName, Ctor);
    }
  }

  /* ──────────────────────────────────────────────
     10. 전역 등록
     ────────────────────────────────────────────── */
  global.Polymer = Polymer;
  global.Polymer._modules = _modules;
  global.Polymer._collectModules = collectExistingModules;
  global.Polymer._registerDomModule = registerDomModule;

})(window);
