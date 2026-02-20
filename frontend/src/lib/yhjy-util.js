/**
 * YHJY As-You-Cost — UT Utility Shim
 *
 * UT.alert(), UT.confirm(), UT.navigateTo(), UT.popup(), UT.getParameter()
 */
(function (global) {
  'use strict';

  /* 공통 메시지 코드 → 한글 매핑 */
  var MSG = {
    'MSG_COM_00001': '필수 입력값을 확인하세요.',
    'MSG_COM_00002': '저장하시겠습니까?',
    'MSG_COM_00003': '저장되었습니다.',
    'MSG_COM_00004': '삭제하시겠습니까?',
    'MSG_COM_00005': '삭제되었습니다.',
    'MSG_COM_00006': '변경된 데이터가 없습니다.',
    'MSG_COM_00007': '선택된 데이터가 없습니다.',
    'MSG_COM_00008': '상태를 변경하시겠습니까?',
    'MSG_COM_00009': '상태가 변경되었습니다.',
    'MSG_COM_00010': '재산출하시겠습니까?',
    'MSG_COM_00011': '재산출이 완료되었습니다.'
  };

  function resolveMsg(msg) {
    return MSG[msg] || msg;
  }

  /* ──────────────────────────────────────────────
     UT 네임스페이스
     ────────────────────────────────────────────── */
  var UT = {};

  /**
   * UT.alert — 단순 알림 다이얼로그
   */
  UT.alert = function (msg) {
    alert(resolveMsg(msg));
  };

  /**
   * UT.confirm — 확인/취소 다이얼로그
   * @param {string} msg  메시지 또는 코드
   * @param {function} callback  확인 시 실행할 콜백
   */
  UT.confirm = function (msg, callback) {
    if (confirm(resolveMsg(msg))) {
      if (typeof callback === 'function') callback();
    }
  };

  /**
   * UT.navigateTo — iframe 기반 화면 이동 (portal.html MDI 탭)
   * 부모 프레임의 openTab 함수를 호출하여 새 탭을 연다.
   */
  UT.navigateTo = function (viewId, param) {
    /* 파라미터를 세션에 저장 */
    if (param) {
      sessionStorage.setItem('__UT_PARAM__' + viewId, JSON.stringify(param));
    }
    /* 부모 portal.html 의 openTab 호출 시도 */
    try {
      if (window.parent && window.parent.openTab) {
        window.parent.openTab(viewId);
      } else {
        /* fallback: viewer.html 직접 이동 */
        window.location.href = '/viewer.html?view=' + viewId;
      }
    } catch (e) {
      window.location.href = '/viewer.html?view=' + viewId;
    }
  };

  /**
   * UT.popup — 팝업 창 열기
   */
  UT.popup = function (opts) {
    var url = opts.url || '';
    var param = opts.param || {};
    var closeFn = opts.close || opts.callback;
    var pw = opts.width  || 800;
    var ph = opts.height || 600;
    sessionStorage.setItem('__UT_PARAM__' + url, JSON.stringify(param));
    var w = window.open('/viewer.html?view=' + url, '_blank', 'width=' + pw + ',height=' + ph);
    if (closeFn) {
      var timer = setInterval(function () {
        if (w.closed) {
          clearInterval(timer);
          var result = sessionStorage.getItem('__UT_POPUP_RESULT__');
          sessionStorage.removeItem('__UT_POPUP_RESULT__');
          closeFn(result ? JSON.parse(result) : null);
        }
      }, 300);
    }
  };

  /**
   * UT.getParameter — 현재 화면으로 전달된 파라미터 조회
   */
  UT.getParameter = function () {
    /* URL 쿼리에서 view 이름 추출 */
    var search = window.location.search || '';
    var match = search.match(/[?&]view=([^&]+)/);
    var viewId = match ? match[1] : '';

    /* 세션에서 파라미터 읽기 후 즉시 제거 (1회성) */
    var key = '__UT_PARAM__' + viewId;
    var stored = sessionStorage.getItem(key);
    if (stored) {
      sessionStorage.removeItem(key);
      try { return JSON.parse(stored); } catch (e) { return {}; }
    }
    return {};
  };

  /**
   * UT.close — 현재 화면(탭) 닫기
   */
  UT.close = function () {
    try {
      if (window.parent && window.parent.closeCurrentTab) {
        window.parent.closeCurrentTab();
      } else {
        window.history.back();
      }
    } catch (e) {
      window.history.back();
    }
  };

  /**
   * 공통코드 일괄 로딩
   * @param {Object} codeMap  { propertyName: grpCd, ... }  예: { currencyList: 'T041', processTypeList: 'T006' }
   * @param {Function} callback  function(codes) — codes = { currencyList: [{label,data},...], ... }
   */
  UT.loadCodes = function (codeMap, callback) {
    var grpCds = [];
    var keys = Object.keys(codeMap);
    for (var i = 0; i < keys.length; i++) {
      var grp = codeMap[keys[i]];
      if (grpCds.indexOf(grp) === -1) grpCds.push(grp);
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/bp/master/code/findListDtlCdMulti.do', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        var raw = JSON.parse(xhr.responseText);
        var codes = {};
        for (var j = 0; j < keys.length; j++) {
          codes[keys[j]] = raw[codeMap[keys[j]]] || [];
        }
        if (typeof callback === 'function') callback(codes);
      }
    };
    xhr.send(JSON.stringify({ grpCds: grpCds }));
  };

  global.UT = UT;

})(window);
