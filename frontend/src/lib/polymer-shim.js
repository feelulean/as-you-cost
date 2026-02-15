/**
 * YHJY As-You-Cost — Polymer 1.x Shim (v2 – 바인딩 메타데이터 기반)
 *
 * ── 핵심 설계 ──
 * 1. {{path}} 를 텍스트로 치환하지 않고, 바인딩 디스크립터를 저장한다.
 * 2. this.set(path, value) 시 해당 path 에 연결된 모든 디스크립터를 순회하며
 *    엘리먼트 타입별 세터를 호출한다 (sc-grid → setDataProvider 등).
 * 3. sc-* 커스텀 엘리먼트는 자체적으로 이벤트를 처리하므로,
 *    polymer-shim 은 네이티브 HTML 요소만 이벤트 바인딩한다.
 * 4. Polymer 호스트 인스턴스는 _isPolymerHost = true 로 표시한다.
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
     2. 경로 유틸
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

  /* ──────────────────────────────────────────────
     3. 바인딩 메타데이터 수집
     ────────────────────────────────────────────── */
  var BIND_RE = /\{\{([^}]+)\}\}/g;

  /**
   * root 내부의 모든 {{path}} 를 스캔하여 디스크립터 배열을 반환한다.
   * 각 디스크립터: { type:'attr'|'text', element, attrName?, path, template }
   * - template: 원본 문자열 (예: "{{searchParam}}" 또는 "prefix-{{val}}-suffix")
   * - path: 첫 번째 바인딩 경로 (단일 바인딩 최적화)
   *
   * ★ 원본 attribute/textContent 를 훼손하지 않고 메타데이터만 추출한다.
   */
  function collectBindings(root) {
    var bindings = [];

    /* 속성 바인딩 */
    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var attrs = el.attributes;
      for (var j = 0; j < attrs.length; j++) {
        var attr = attrs[j];
        if (BIND_RE.test(attr.value)) {
          var template = attr.value;
          /* 모든 경로 추출 */
          var paths = [];
          template.replace(BIND_RE, function (_, expr) {
            paths.push(expr.trim());
          });
          bindings.push({
            type: 'attr',
            element: el,
            attrName: attr.name,
            template: template,
            paths: paths
          });
          /* 원본 속성값을 _bindTemplates 에 저장하고 빈 문자열로 초기화 */
          attr.value = '';
        }
      }
    }

    /* 텍스트 노드 바인딩 */
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (BIND_RE.test(node.textContent)) {
        var tpl = node.textContent;
        var tpaths = [];
        tpl.replace(BIND_RE, function (_, expr) {
          tpaths.push(expr.trim());
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

  /**
   * 특정 path 에 영향받는 바인딩만 갱신한다.
   * path 가 null 이면 전체 바인딩을 갱신한다.
   */
  function applyBindings(bindings, ctx, changedPath) {
    for (var i = 0; i < bindings.length; i++) {
      var b = bindings[i];

      /* changedPath 가 지정되면 관련 바인딩만 갱신 */
      if (changedPath) {
        var related = false;
        for (var p = 0; p < b.paths.length; p++) {
          if (isPathRelated(b.paths[p], changedPath)) {
            related = true;
            break;
          }
        }
        if (!related) continue;
      }

      var resolved = b.template.replace(BIND_RE, function (_, expr) {
        var v = getByPath(ctx, expr.trim());
        return v == null ? '' : v;
      });

      if (b.type === 'text') {
        b.element.textContent = resolved;
      } else if (b.type === 'attr') {
        applyAttrBinding(b, resolved, ctx);
      }
    }
  }

  /**
   * path 관련성 판단:
   * changedPath='searchParam' 이면 'searchParam', 'searchParam.bizUnit' 등 모두 관련
   * changedPath='searchParam.bizUnit' 이면 'searchParam.bizUnit', 'searchParam' 관련
   */
  function isPathRelated(bindPath, changedPath) {
    return bindPath === changedPath ||
           bindPath.indexOf(changedPath + '.') === 0 ||
           changedPath.indexOf(bindPath + '.') === 0;
  }

  /**
   * 속성 바인딩을 적용한다.
   * sc-grid[data-provider], sc-ajax[body] 등 특수 속성은 별도 처리.
   */
  function applyAttrBinding(binding, resolvedValue, ctx) {
    var el = binding.element;
    var attrName = binding.attrName;
    var tag = el.tagName.toLowerCase();

    /* ── sc-grid data-provider: 배열을 setDataProvider()로 전달 ── */
    if (tag === 'sc-grid' && attrName === 'data-provider') {
      var path = binding.paths[0];
      var data = getByPath(ctx, path);
      if (Array.isArray(data) && typeof el.setDataProvider === 'function') {
        el.setDataProvider(data);
      }
      return;
    }

    /* ── sc-ajax body: 경로만 저장 (generateRequest 시 resolve) ── */
    if (tag === 'sc-ajax' && attrName === 'body') {
      el._bodyPath = binding.paths[0];
      el._polymerHost = ctx;
      return;
    }

    /* ── sc-combobox-field items: 배열을 setItems()로 전달 ── */
    if (tag === 'sc-combobox-field' && attrName === 'items') {
      var itemPath = binding.paths[0];
      var items = getByPath(ctx, itemPath);
      if (Array.isArray(items) && typeof el.setItems === 'function') {
        el.setItems(items);
      }
      return;
    }

    /* ── sc-text-field, sc-combobox-field, sc-number-field value: 양방향 바인딩 ── */
    if (attrName === 'value' && (
        tag === 'sc-text-field' || tag === 'sc-combobox-field' ||
        tag === 'sc-number-field' || tag === 'sc-datepicker')) {
      el._valuePath = binding.paths[0];
      el._polymerHost = ctx;
      var val = getByPath(ctx, binding.paths[0]);
      if (typeof el.setValue === 'function') {
        el.setValue(val == null ? '' : val);
      }
      return;
    }

    /* ── 일반 속성: 문자열로 설정 ── */
    el.setAttribute(attrName, resolvedValue);
    if (attrName === 'value' && 'value' in el) {
      el.value = resolvedValue;
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
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el._polyBound) continue;

      /* sc-* 엘리먼트는 자체 이벤트 처리 → 스킵 */
      if (isScElement(el)) {
        el._polyBound = true;
        continue;
      }

      var attrs = el.attributes;
      for (var j = 0; j < attrs.length; j++) {
        var attr = attrs[j];
        if (attr.name.indexOf('on-') === 0) {
          var evtName = attr.name.substring(3);
          var methodName = attr.value;
          if (typeof ctx[methodName] === 'function') {
            (function (mn, en) {
              el.addEventListener(en, function (e) { ctx[mn](e); });
            })(methodName, evtName);
          }
        }
      }
      el._polyBound = true;
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
     7. Polymer() — 메인 등록 함수
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

      /* this.$ 구축 */
      me.$ = buildDollarMap(me);

      /* 바인딩 메타데이터 수집 (한 번만) */
      me._bindings = collectBindings(me);

      /* this.set() — path 기반 값 설정 + 스마트 업데이트 */
      me.set = function (path, value) {
        setByPath(me, path, value);
        applyBindings(me._bindings, me, path);
      };

      /* 초기 바인딩 적용 (전체) */
      applyBindings(me._bindings, me, null);

      /* sc-* 컴포넌트에 호스트 참조 주입 */
      var scEls = me.querySelectorAll('*');
      for (var i = 0; i < scEls.length; i++) {
        if (isScElement(scEls[i])) {
          scEls[i]._polymerHost = me;
        }
      }

      /* 이벤트 바인딩 (네이티브 요소만) */
      bindEvents(me, me);

      /* attached() 라이프사이클 */
      if (typeof me.attached === 'function') {
        setTimeout(function () { me.attached(); }, 0);
      }
    };

    if (!customElements.get(tagName)) {
      customElements.define(tagName, Ctor);
    }
  }

  /* ──────────────────────────────────────────────
     8. 전역 등록
     ────────────────────────────────────────────── */
  global.Polymer = Polymer;
  global.Polymer._modules = _modules;
  global.Polymer._collectModules = collectExistingModules;
  global.Polymer._registerDomModule = registerDomModule;

})(window);
