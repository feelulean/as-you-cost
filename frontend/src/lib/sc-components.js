/**
 * YHJY As-You-Cost — SC Component Stubs (v2.1 – Caidentia 디자인 적용)
 *
 * ── 핵심 설계 ──
 * 1. 각 sc-* 컴포넌트는 _polymerHost 를 통해 Polymer 호스트에 접근한다.
 * 2. sc-ajax: body 는 _bodyPath 에 경로만 저장, generateRequest 시점에 resolve.
 * 3. sc-button: 자체 click → _polymerHost[handler] 호출 (polymer-shim 은 관여하지 않음).
 * 4. sc-text-field / sc-combobox-field: 양방향 바인딩 (입력 변경 → host property 갱신).
 * 5. sc-grid: editable 컬럼은 input 으로 렌더, cell-value-changed 이벤트 발생.
 * 6. 인라인 스타일 최소화 → yhjy-components.css 의 외부 스타일에 위임.
 */
(function (global) {
  'use strict';

  function define(tag, Ctor) {
    if (!customElements.get(tag)) customElements.define(tag, Ctor);
  }

  /** Polymer 호스트 탐색 */
  function findHost(el) {
    if (el._polymerHost) return el._polymerHost;
    var p = el.parentElement;
    while (p) {
      if (p._isPolymerHost) return p;
      if (p._polymerHost) return p._polymerHost;
      p = p.parentElement;
    }
    return null;
  }

  /* ================================================================
     sc-ajax  —  서버 Ajax 호출
     ================================================================ */
  var ScAjax = function () { return Reflect.construct(HTMLElement, [], ScAjax); };
  Object.setPrototypeOf(ScAjax.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScAjax, HTMLElement);

  ScAjax.prototype.connectedCallback = function () {
    this.style.display = 'none';
  };

  ScAjax.prototype.generateRequest = function () {
    var me = this;
    var url = me.getAttribute('url') || '';
    var respHandler = me.getAttribute('on-response') || '';
    var host = me._polymerHost || findHost(me);

    var bodyData = {};
    if (me._bodyPath && host) {
      var parts = me._bodyPath.split('.');
      var obj = host;
      for (var i = 0; i < parts.length; i++) {
        if (obj == null) break;
        obj = obj[parts[i]];
      }
      if (obj && typeof obj === 'object') bodyData = obj;
    }

    console.log('[sc-ajax] POST', url, bodyData);

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      console.log('[sc-ajax] 응답:', url, data);
      if (respHandler && host && typeof host[respHandler] === 'function') {
        host[respHandler]({ detail: { response: data } });
      }
    })
    .catch(function (err) {
      console.warn('[sc-ajax] 요청 실패:', url, err);
      if (respHandler && host && typeof host[respHandler] === 'function') {
        host[respHandler]({ detail: { response: [] } });
      }
    });
  };

  define('sc-ajax', ScAjax);

  /* ================================================================
     sc-grid  —  데이터 그리드 (인라인 편집 지원)
     ================================================================ */
  var ScGrid = function () { return Reflect.construct(HTMLElement, [], ScGrid); };
  Object.setPrototypeOf(ScGrid.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScGrid, HTMLElement);

  ScGrid.prototype.connectedCallback = function () {
    this._data = [];
    this._modifiedSet = {};
    this._selectedIdx = -1;
    this._columns = [];
    this._isTree = this.getAttribute('is-tree') === 'true';
    this._treeField = this.getAttribute('tree-field') || '';
    this._editable = this.getAttribute('editable') !== 'false';
    /* 외부 CSS(sc-grid, .sc-grid) 가 적용됨. 최소한의 기본값만 설정 */

    var me = this;
    setTimeout(function () { me._parseColumns(); me._render(); }, 0);
  };

  ScGrid.prototype._parseColumns = function () {
    this._columns = [];
    var cols = this.querySelectorAll(
      'sc-data-column, sc-combobox-column, sc-checkbox-column, sc-image-column'
    );
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      this._columns.push({
        field: c.getAttribute('data-field') || '',
        header: c.getAttribute('header-text') || '',
        width: c.getAttribute('width') || 'auto',
        align: c.getAttribute('text-align') || 'left',
        editable: this._editable && c.getAttribute('editable') !== 'false',
        type: c.getAttribute('data-type') || 'text',
        format: c.getAttribute('format-type') || c.getAttribute('format') || '',
        tag: c.tagName.toLowerCase(),
        onItemClick: c.getAttribute('on-item-click') || ''
      });
    }
  };

  ScGrid.prototype._render = function () {
    var old = this.querySelector('.sc-grid-wrap');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.className = 'sc-grid-wrap';
    /* CSS 클래스로 스타일 적용, 최소 인라인만 */
    wrap.style.cssText = 'flex:1; overflow:auto; min-height:0;';

    var table = document.createElement('table');
    table.style.cssText = 'width:100%; border-collapse:collapse; font-size:12px;';

    /* thead */
    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    for (var i = 0; i < this._columns.length; i++) {
      var th = document.createElement('th');
      th.textContent = this._columns[i].header;
      th.style.textAlign = this._columns[i].align;
      if (this._columns[i].width !== 'auto') th.style.width = this._columns[i].width + 'px';
      htr.appendChild(th);
    }
    thead.appendChild(htr);
    table.appendChild(thead);

    /* tbody */
    var tbody = document.createElement('tbody');
    var rows = this._data || [];
    if (this._isTree) {
      this._renderTreeRows(tbody, rows, 0);
    } else {
      for (var r = 0; r < rows.length; r++) {
        this._renderRow(tbody, rows[r], r);
      }
    }
    table.appendChild(tbody);
    wrap.appendChild(table);

    if (rows.length === 0) {
      var empty = document.createElement('div');
      empty.style.cssText = 'padding:40px; text-align:center; color:#667085; font-size:13px;';
      empty.textContent = '데이터가 없습니다. 조회 버튼을 클릭하세요.';
      wrap.appendChild(empty);
    }

    this.appendChild(wrap);
  };

  /** 숫자 포맷 (콤마) */
  function formatNumber(val) {
    var n = Number(val);
    if (isNaN(n)) return val;
    return n.toLocaleString();
  }

  ScGrid.prototype._renderRow = function (tbody, row, idx) {
    var tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    var me = this;

    tr.addEventListener('click', function () {
      me._selectedIdx = idx;
      var allTrs = tbody.querySelectorAll('tr');
      for (var t = 0; t < allTrs.length; t++) allTrs[t].style.background = '';
      tr.style.background = 'rgba(105, 84, 254, 0.08)';
      /* on-item-click 이벤트 발생 */
      var itemClickHandler = me.getAttribute('on-item-click');
      if (itemClickHandler) {
        var host = findHost(me);
        if (host && typeof host[itemClickHandler] === 'function') {
          host[itemClickHandler]({ detail: { row: row, rowIndex: idx } });
        }
      }
    });

    for (var c = 0; c < this._columns.length; c++) {
      var col = this._columns[c];
      var td = document.createElement('td');
      td.style.textAlign = col.align;
      var val = row[col.field];
      if (val == null) val = '';

      if (col.editable) {
        var inp = document.createElement('input');
        inp.type = (col.type === 'number') ? 'number' : 'text';
        inp.value = val;
        inp.style.textAlign = col.align;
        /* CSS 클래스로 스타일 적용됨: .sc-grid-wrap table tbody td input */

        (function (field, rowIdx, input) {
          input.addEventListener('change', function () {
            var newVal = input.value;
            if (col.type === 'number') newVal = Number(newVal) || 0;
            me._data[rowIdx][field] = newVal;
            me._modifiedSet[rowIdx] = true;
            var host = findHost(me);
            var evtHandler = me.getAttribute('on-cell-value-changed');
            if (evtHandler && host && typeof host[evtHandler] === 'function') {
              host[evtHandler]({
                detail: {
                  dataField: field,
                  rowIndex: rowIdx,
                  value: newVal
                }
              });
            }
          });
        })(col.field, idx, inp);

        td.appendChild(inp);
      } else {
        if (col.format === 'amt' || col.format === '#,###') {
          val = formatNumber(val);
        }
        if (col.tag === 'sc-checkbox-column') {
          val = (String(val) === 'Y') ? 'Y' : 'N';
        }
        /* 컬럼 레벨 on-item-click: 코드/일련번호를 클릭 가능한 링크로 렌더링 */
        if (col.onItemClick && (col.tag === 'sc-image-column' || val)) {
          (function (colDef, cellVal, rowData, rowIdx) {
            var link = document.createElement('a');
            link.href = 'javascript:void(0)';
            if (colDef.tag === 'sc-image-column') {
              link.textContent = colDef.header || '조회';
              link.style.cssText = 'color:#6954FE; cursor:pointer; font-size:11px;';
            } else {
              link.textContent = cellVal;
              link.style.cssText = 'color:#6954FE; text-decoration:none; cursor:pointer; font-weight:500;';
              link.addEventListener('mouseenter', function () { link.style.textDecoration = 'underline'; });
              link.addEventListener('mouseleave', function () { link.style.textDecoration = 'none'; });
            }
            link.addEventListener('click', function (e) {
              e.stopPropagation();
              var host = findHost(me);
              if (host && typeof host[colDef.onItemClick] === 'function') {
                host[colDef.onItemClick]({ detail: { row: rowData, rowIndex: rowIdx, dataField: colDef.field } });
              }
            });
            td.appendChild(link);
          })(col, val, row, idx);
        } else {
          td.textContent = val;
        }
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  };

  ScGrid.prototype._renderTreeRows = function (tbody, rows, depth) {
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tr = document.createElement('tr');
      tr.style.cursor = 'pointer';

      for (var c = 0; c < this._columns.length; c++) {
        var col = this._columns[c];
        var td = document.createElement('td');
        td.style.textAlign = col.align;
        var val = row[col.field];
        if (val == null) val = '';
        if (col.format === 'amt' || col.format === '#,###') val = formatNumber(val);
        if (col.field === this._treeField) {
          var indent = depth * 20;
          var prefix = (row.children && row.children.length > 0) ? '\u25BC ' : '  \u2022 ';
          td.style.paddingLeft = (8 + indent) + 'px';
          td.textContent = prefix + val;
        } else {
          td.textContent = val;
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);

      if (row.children && row.children.length > 0) {
        this._renderTreeRows(tbody, row.children, depth + 1);
      }
    }
  };

  /* Grid API */
  ScGrid.prototype.getSelectedRows = function () {
    if (this._selectedIdx >= 0 && this._data[this._selectedIdx]) {
      return [this._data[this._selectedIdx]];
    }
    return [];
  };
  ScGrid.prototype.getModifiedRows = function () {
    var result = [];
    for (var idx in this._modifiedSet) {
      if (this._modifiedSet.hasOwnProperty(idx) && this._data[idx]) {
        result.push(this._data[idx]);
      }
    }
    return result.length > 0 ? result : this._data.slice();
  };
  ScGrid.prototype.getAllRows = function () { return this._data || []; };
  ScGrid.prototype.insertRow = function (idx, row) {
    this._data.splice(idx, 0, row);
    this._render();
  };
  ScGrid.prototype.setCellData = function (rowIdx, field, val) {
    if (this._data[rowIdx]) {
      this._data[rowIdx][field] = val;
      this._updateCellDOM(rowIdx, field, val);
    }
  };
  ScGrid.prototype.getCellData = function (rowIdx, field) {
    return this._data[rowIdx] ? this._data[rowIdx][field] : undefined;
  };

  ScGrid.prototype._updateCellDOM = function (rowIdx, field, val) {
    var wrap = this.querySelector('.sc-grid-wrap');
    if (!wrap) return;
    var rows = wrap.querySelectorAll('tbody tr');
    if (!rows[rowIdx]) return;
    var cells = rows[rowIdx].querySelectorAll('td');
    for (var c = 0; c < this._columns.length; c++) {
      if (this._columns[c].field === field) {
        var td = cells[c];
        if (!td) break;
        var inp = td.querySelector('input');
        if (inp) {
          inp.value = val;
        } else {
          var col = this._columns[c];
          var displayVal = val;
          if (col.format === 'amt' || col.format === '#,###') displayVal = formatNumber(val);
          var link = td.querySelector('a');
          if (link) {
            link.textContent = displayVal == null ? '' : displayVal;
          } else {
            td.textContent = displayVal == null ? '' : displayVal;
          }
        }
        break;
      }
    }
  };

  ScGrid.prototype.exportToExcel = function (opts) {
    var fileName = (opts && opts.fileName) || 'export.xlsx';
    if (typeof XLSX !== 'undefined') {
      var wsData = [this._columns.map(function (c) { return c.header; })];
      for (var r = 0; r < this._data.length; r++) {
        var row = [];
        for (var c = 0; c < this._columns.length; c++) {
          row.push(this._data[r][this._columns[c].field] || '');
        }
        wsData.push(row);
      }
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, fileName);
    } else {
      alert('엑셀 다운로드: ' + fileName);
    }
  };

  ScGrid.prototype.setDataProvider = function (data) {
    this._data = data || [];
    this._modifiedSet = {};
    this._selectedIdx = -1;
    this._render();
  };

  define('sc-grid', ScGrid);

  /* ================================================================
     sc-search-container  — Caidentia 디자인 기준
     ================================================================ */
  var ScSearch = function () { return Reflect.construct(HTMLElement, [], ScSearch); };
  Object.setPrototypeOf(ScSearch.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScSearch, HTMLElement);
  ScSearch.prototype.connectedCallback = function () {
    /* 외부 CSS(sc-search-container) 가 적용됨 */
    var btn = document.createElement('button');
    btn.textContent = '조회';
    btn.className = 'sc-search-btn';
    btn.style.cssText = 'margin-top:8px; padding:6px 16px; background:#6954FE; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; font-family:inherit; transition:background 0.15s;';
    btn.addEventListener('mouseenter', function () { btn.style.background = '#532DF6'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = '#6954FE'; });
    var me = this;
    btn.addEventListener('click', function () {
      var handler = me.getAttribute('on-search');
      var host = findHost(me);
      if (handler && host && typeof host[handler] === 'function') host[handler]();
    });
    this.appendChild(btn);
  };
  define('sc-search-container', ScSearch);

  /* ================================================================
     sc-panel  — Caidentia 디자인 기준
     ================================================================ */
  var ScPanel = function () { return Reflect.construct(HTMLElement, [], ScPanel); };
  Object.setPrototypeOf(ScPanel.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScPanel, HTMLElement);
  ScPanel.prototype.connectedCallback = function () {
    var title = this.getAttribute('title-text') || '';
    /* 외부 CSS(sc-panel) 가 적용됨 */
    if (title) {
      var h = document.createElement('div');
      h.style.cssText = 'margin-bottom:10px; font-size:15px; font-weight:600; color:#30374F;';
      h.textContent = title;
      this.insertBefore(h, this.firstChild);
    }
  };
  define('sc-panel', ScPanel);

  /* ================================================================
     sc-toolbar
     ================================================================ */
  var ScToolbar = function () { return Reflect.construct(HTMLElement, [], ScToolbar); };
  Object.setPrototypeOf(ScToolbar.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScToolbar, HTMLElement);
  ScToolbar.prototype.connectedCallback = function () {
    /* 외부 CSS(sc-toolbar) 가 적용됨 */
  };
  define('sc-toolbar', ScToolbar);

  /* ================================================================
     sc-button  — Caidentia 디자인 기준 (자체 이벤트 처리)
     ================================================================ */
  var ScButton = function () { return Reflect.construct(HTMLElement, [], ScButton); };
  Object.setPrototypeOf(ScButton.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScButton, HTMLElement);
  ScButton.prototype.connectedCallback = function () {
    var text = this.getAttribute('text') || '';
    var btn = document.createElement('button');
    btn.textContent = text;
    /* 외부 CSS(sc-button button) 가 적용됨 */

    var handler = this.getAttribute('on-click');
    var me = this;
    if (handler) {
      btn.addEventListener('click', function (e) {
        var host = findHost(me);
        if (host && typeof host[handler] === 'function') host[handler](e);
      });
    }
    this.textContent = '';
    this.appendChild(btn);
  };
  Object.defineProperty(ScButton.prototype, 'text', {
    set: function (v) { var b = this.querySelector('button'); if (b) b.textContent = v; }
  });
  define('sc-button', ScButton);

  /* ================================================================
     sc-label  — Caidentia 디자인 기준
     ================================================================ */
  var ScLabel = function () { return Reflect.construct(HTMLElement, [], ScLabel); };
  Object.setPrototypeOf(ScLabel.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScLabel, HTMLElement);
  ScLabel.prototype.connectedCallback = function () {
    var text = this.getAttribute('text') || '';
    var req = this.getAttribute('required') === 'true';
    /* 외부 CSS(sc-label) 가 적용됨 */
    this.textContent = text;
    if (req) {
      var star = document.createElement('span');
      star.textContent = ' *';
      star.style.cssText = 'color:#DD0000; font-size:14px; font-weight:600; padding-left:3px;';
      this.appendChild(star);
    }
  };
  define('sc-label', ScLabel);

  /* ================================================================
     sc-text-field  — 양방향 바인딩 (Caidentia 디자인 기준)
     ================================================================ */
  var ScTextField = function () { return Reflect.construct(HTMLElement, [], ScTextField); };
  Object.setPrototypeOf(ScTextField.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScTextField, HTMLElement);
  ScTextField.prototype.connectedCallback = function () {
    var ro = this.getAttribute('readonly') === 'true';
    var ph = this.getAttribute('placeholder') || '';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.readOnly = ro;
    inp.placeholder = ph;
    /* 외부 CSS(sc-text-field input) 가 적용됨 */

    var me = this;
    inp.addEventListener('input', function () {
      if (me._valuePath && me._polymerHost) {
        var parts = me._valuePath.split('.');
        var obj = me._polymerHost;
        for (var i = 0; i < parts.length - 1; i++) {
          if (obj[parts[i]] == null) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = inp.value;
      }
    });

    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var enterHandler = me.getAttribute('on-enter');
        var host = findHost(me);
        if (enterHandler && host && typeof host[enterHandler] === 'function') {
          host[enterHandler](e);
        }
      }
    });

    this.appendChild(inp);
  };
  ScTextField.prototype.setValue = function (v) {
    var inp = this.querySelector('input');
    if (inp) inp.value = (v == null ? '' : v);
  };
  define('sc-text-field', ScTextField);

  /* ================================================================
     sc-combobox-field  — 양방향 바인딩 + items 렌더링
     ================================================================ */
  var ScCombo = function () { return Reflect.construct(HTMLElement, [], ScCombo); };
  Object.setPrototypeOf(ScCombo.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScCombo, HTMLElement);
  ScCombo.prototype.connectedCallback = function () {
    var ph = this.getAttribute('placeholder') || '선택';
    this._displayField = this.getAttribute('display-field') || 'label';
    this._valueField = this.getAttribute('value-field') || 'data';

    var sel = document.createElement('select');
    /* 외부 CSS(sc-combobox-field select) 가 적용됨 */
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = ph;
    sel.appendChild(opt0);

    var me = this;
    sel.addEventListener('change', function () {
      if (me._valuePath && me._polymerHost) {
        var parts = me._valuePath.split('.');
        var obj = me._polymerHost;
        for (var i = 0; i < parts.length - 1; i++) {
          if (obj[parts[i]] == null) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = sel.value;
      }
    });

    this.appendChild(sel);
  };
  ScCombo.prototype.setItems = function (items) {
    var sel = this.querySelector('select');
    if (!sel) return;
    while (sel.options.length > 1) sel.remove(1);
    if (!Array.isArray(items)) return;
    for (var i = 0; i < items.length; i++) {
      var opt = document.createElement('option');
      opt.value = items[i][this._valueField] || '';
      opt.textContent = items[i][this._displayField] || '';
      sel.appendChild(opt);
    }
  };
  ScCombo.prototype.setValue = function (v) {
    var sel = this.querySelector('select');
    if (sel) sel.value = (v == null ? '' : v);
  };
  define('sc-combobox-field', ScCombo);

  /* ================================================================
     sc-number-field  — 양방향 바인딩
     ================================================================ */
  var ScNumber = function () { return Reflect.construct(HTMLElement, [], ScNumber); };
  Object.setPrototypeOf(ScNumber.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScNumber, HTMLElement);
  ScNumber.prototype.connectedCallback = function () {
    var ro = this.getAttribute('readonly') === 'true';
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.readOnly = ro;
    /* 외부 CSS(sc-number-field input) 가 적용됨 */
    inp.style.textAlign = 'right';

    var me = this;
    inp.addEventListener('input', function () {
      if (me._valuePath && me._polymerHost) {
        var parts = me._valuePath.split('.');
        var obj = me._polymerHost;
        for (var i = 0; i < parts.length - 1; i++) {
          if (obj[parts[i]] == null) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = Number(inp.value) || 0;
      }
    });

    this.appendChild(inp);
  };
  ScNumber.prototype.setValue = function (v) {
    var inp = this.querySelector('input');
    if (inp) inp.value = (v == null ? '' : v);
  };
  define('sc-number-field', ScNumber);

  /* ================================================================
     sc-datepicker  — 양방향 바인딩
     ================================================================ */
  var ScDate = function () { return Reflect.construct(HTMLElement, [], ScDate); };
  Object.setPrototypeOf(ScDate.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(ScDate, HTMLElement);
  ScDate.prototype.connectedCallback = function () {
    var inp = document.createElement('input');
    inp.type = 'date';
    /* 외부 CSS(sc-datepicker input) 가 적용됨 */

    var me = this;
    inp.addEventListener('change', function () {
      if (me._valuePath && me._polymerHost) {
        var parts = me._valuePath.split('.');
        var obj = me._polymerHost;
        for (var i = 0; i < parts.length - 1; i++) {
          if (obj[parts[i]] == null) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = inp.value;
      }
    });

    this.appendChild(inp);
  };
  ScDate.prototype.setValue = function (v) {
    var inp = this.querySelector('input');
    if (inp) inp.value = (v == null ? '' : v);
  };
  define('sc-datepicker', ScDate);

  /* ================================================================
     마크업 전용 (내부 자식 요소, 렌더링 불필요)
     ================================================================ */
  var noopTags = [
    'sc-grid-columns', 'sc-data-column', 'sc-combobox-column',
    'sc-checkbox-column', 'sc-image-column', 'sc-group-column',
    'sc-grid-fields', 'sc-grid-field'
  ];
  noopTags.forEach(function (tag) {
    var C = function () { return Reflect.construct(HTMLElement, [], C); };
    Object.setPrototypeOf(C.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(C, HTMLElement);
    C.prototype.connectedCallback = function () { this.style.display = 'none'; };
    define(tag, C);
  });

})(window);
