# [As-you-Cost] 화면 UI/UX 구현 명세 및 Skeleton Code

본 문서는 화면 정의서 및 매뉴얼을 바탕으로 도출된 핵심 화면 2종의 표준 UI 구조입니다. UI 개발(퍼블리싱) 시 반드시 아래의 Layout 구조와 YHJY의 Polymer 커스텀 태그를 사용하여 작성해야 합니다.

## 1. 기준정보 관리 - 원가 절감 활동 유형 Master 화면 (`es-cost-reduction-type-list.html`)

### 📌 화면 요구사항 분석
* 검색 조건으로 '분류차수' 콤보박스를 사용합니다.
* 화면 제어를 위해 '조회', '추가', '엑셀업로드', '저장' 버튼이 상단에 배치되어야 합니다.
* 하단 데이터 그리드에는 '항목코드', '1차분류', '2차분류', '3차분류' 컬럼이 포함되며 사용자가 직접 입력이 가능해야 합니다.

### 💻 HTML Skeleton Code (Polymer 1.6)
```html
<dom-module id="es-cost-reduction-type-list">
    <template>
        <sc-search-container on-search="onFindList" auth-code="V">
            <table>
                <colgroup>
                    <col style="width:120px"/>
                    <col/>
                </colgroup>
                <tr>
                    <th><sc-label text="분류차수"></sc-label></th>
                    <td>
                        <sc-combobox-field value="{{searchParam.clsRev}}" items="{{codes.clsRevList}}" display-field="label" value-field="data" placeholder="선택"></sc-combobox-field>
                    </td>
                </tr>
            </table>
        </sc-search-container>

        <sc-grid id="gridPanel" data-provider="{{resultList}}" editable="true" class="flex">
            <sc-toolbar>
                <sc-button text="조회" on-click="onFindList" auth-code="V"></sc-button>
                <sc-button text="추가" on-click="onAddRow" auth-code="S"></sc-button>
                <sc-button text="엑셀업로드" on-click="onExcelUpload" auth-code="S"></sc-button>
                <sc-button text="저장" on-click="onSaveList" auth-code="S"></sc-button>
            </sc-toolbar>
            
            <sc-grid-columns>
                <sc-data-column data-field="itemCd" header-text="항목코드" width="150" editable="true" required="true"></sc-data-column>
                <sc-data-column data-field="cls1Nm" header-text="1차분류" width="200" editable="true"></sc-data-column>
                <sc-data-column data-field="cls2Nm" header-text="2차분류" width="200" editable="true"></sc-data-column>
                <sc-data-column data-field="cls3Nm" header-text="3차분류" width="200" editable="true"></sc-data-column>
            </sc-grid-columns>
        </sc-grid>
    </template>
    <script>
        Polymer({
            is: 'es-cost-reduction-type-list',
            properties: {
                searchParam: { type: Object, value: function() { return {}; } },
                resultList: { type: Array, value: function() { return []; } },
                codes: { type: Object, value: function() { return { clsRevList: [] }; } }
            }
        });
    </script>
</dom-module>