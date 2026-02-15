# [As-you-Cost] 현상원가 관리 화면 UI/UX 구현 명세 및 Skeleton Code

본 문서는 현상원가(Current/Temp Cost) 프로세스의 핵심 화면 2종에 대한 표준 UI 구조입니다. UI 개발(퍼블리싱) 시 반드시 아래의 Layout 구조와 YHJY의 Polymer 1.6 커스텀 태그를 사용하여 작성해야 합니다.

## 1. 현상원가 - 프로젝트 신규 등록 및 조회 화면 (`es-current-cost-project-list.html`)

### 📌 화면 요구사항 분석
* 상단 검색 조건으로 '프로젝트 코드', '사업부', '고객사', '차종' 필드를 구성합니다.
* 사업부 검색 조건은 'PT'와 'SEAT' 중에서 선택할 수 있도록 콤보박스로 구성합니다.
* 그리드 상단 툴바에는 '조회', '신규', '수정', '진행상태변경', '재산출', '산출결과 등록' 버튼을 배치하여 프로젝트의 현상원가 산출 단계를 제어합니다.
* 하단 그리드에는 프로젝트 기본 정보와 함께 '현상 차수(Revision)'가 구분되어 표시되어야 합니다.

### 💻 HTML Skeleton Code
```html
<dom-module id="es-current-cost-project-list">
    <template>
        <sc-search-container on-search="onFindList" auth-code="V">
            <table>
                <colgroup>
                    <col style="width:120px"/>
                    <col/>
                    <col style="width:120px"/>
                    <col/>
                </colgroup>
                <tr>
                    <th><sc-label text="프로젝트 코드"></sc-label></th>
                    <td>
                        <sc-text-field value="{{searchParam.pjtCd}}" on-enter="onFindList"></sc-text-field>
                    </td>
                    <th><sc-label text="사업부"></sc-label></th>
                    <td>
                        <sc-combobox-field value="{{searchParam.bizUnit}}" items="{{codes.bizUnitList}}" display-field="label" value-field="data" placeholder="전체"></sc-combobox-field>
                    </td>
                </tr>
                <tr>
                    <th><sc-label text="고객사"></sc-label></th>
                    <td>
                        <sc-text-field value="{{searchParam.custNm}}"></sc-text-field>
                    </td>
                    <th><sc-label text="차종"></sc-label></th>
                    <td>
                        <sc-text-field value="{{searchParam.carType}}"></sc-text-field>
                    </td>
                </tr>
            </table>
        </sc-search-container>

        <sc-grid id="gridPanel" data-provider="{{resultList}}" selection-mode="radio" class="flex">
            <sc-toolbar>
                <sc-button text="조회" on-click="onFindList" auth-code="V"></sc-button>
                <sc-button text="신규" on-click="onAddProject" auth-code="S"></sc-button>
                <sc-button text="수정" on-click="onEditProject" auth-code="S"></sc-button>
                <sc-button text="진행상태변경" on-click="onChangeStatus" auth-code="S"></sc-button>
                <sc-button text="재산출" on-click="onRecalculate" auth-code="S"></sc-button>
                <sc-button text="산출결과 등록" on-click="onRegisterResult" auth-code="S"></sc-button>
            </sc-toolbar>
            
            <sc-grid-columns>
                <sc-data-column data-field="pjtCd" header-text="프로젝트 코드" width="120" text-align="center"></sc-data-column>
                <sc-data-column data-field="pjtNm" header-text="프로젝트명" width="250" text-align="left"></sc-data-column>
                <sc-combobox-column data-field="bizUnit" header-text="사업부" width="100" items="{{codes.bizUnitList}}" display-field="label" value-field="data"></sc-combobox-column>
                <sc-data-column data-field="custNm" header-text="고객사" width="150"></sc-data-column>
                <sc-data-column data-field="carType" header-text="차종" width="120"></sc-data-column>
                <sc-data-column data-field="ccRev" header-text="현상차수" width="80" text-align="center"></sc-data-column>
                <sc-data-column data-field="progSts" header-text="진행상태" width="100" text-align="center"></sc-data-column>
            </sc-grid-columns>
        </sc-grid>
    </template>
    <script>
        Polymer({
            is: 'es-current-cost-project-list',
            properties: {
                searchParam: { type: Object, value: function() { return {}; } },
                resultList: { type: Array, value: function() { return []; } },
                codes: { 
                    type: Object, 
                    value: function() { 
                        return { 
                            bizUnitList: [ {label: 'PT', data: 'PT'}, {label: 'SEAT', data: 'SEAT'} ]
                        }; 
                    } 
                }
            }
        });
    </script>
</dom-module>