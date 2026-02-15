# [As-you-Cost] 목표원가 관리 화면 UI/UX 구현 명세 및 Skeleton Code

본 문서는 목표원가(Target Cost) 프로세스의 핵심 화면 2종에 대한 표준 UI 구조입니다. UI 개발(퍼블리싱) 시 반드시 아래의 Layout 구조와 YHJY의 Polymer 1.6 커스텀 태그를 사용하여 작성해야 합니다.

## 1. 목표원가 - 프로젝트 등록 및 견적코드 매핑 화면 (`es-target-cost-project-list.html`)

### 📌 화면 요구사항 분석
* 상단 검색 조건으로 '프로젝트 코드', '사업부', '고객사', '차종' 필드를 제공하여 기존 프로젝트를 조회합니다.
* 화면 제어를 위해 '조회', '추가', '삭제', '저장' 버튼을 상단에 배치합니다.
* '추가' 버튼 클릭 시 신규 프로젝트를 등록할 수 있는 행이 생성되며, 그리드 내에 '프로젝트 코드', '프로젝트명', '사업부', 'OEM', '제품군' 컬럼이 포함되어야 합니다.
* 견적원가에서 확정된 데이터를 불러오기 위해 '견적코드 조회화면으로 이동'할 수 있는 매핑 컬럼(돋보기 아이콘 등)이 필수적으로 존재해야 합니다.

### 💻 HTML Skeleton Code
```html
<dom-module id="es-target-cost-project-list">
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

        <sc-grid id="gridPanel" data-provider="{{resultList}}" editable="true" class="flex">
            <sc-toolbar>
                <sc-button text="조회" on-click="onFindList" auth-code="V"></sc-button>
                <sc-button text="추가" on-click="onAddRow" auth-code="S"></sc-button>
                <sc-button text="삭제" on-click="onDeleteList" auth-code="S"></sc-button>
                <sc-button text="저장" on-click="onSaveList" auth-code="S"></sc-button>
            </sc-toolbar>
            
            <sc-grid-columns>
                <sc-data-column data-field="pjtCd" header-text="프로젝트 코드" width="120" editable="false" text-align="center"></sc-data-column>
                <sc-data-column data-field="pjtNm" header-text="프로젝트명" width="250" editable="true" required="true" text-align="left"></sc-data-column>
                <sc-combobox-column data-field="bizUnit" header-text="사업부" width="100" editable="true" items="{{codes.bizUnitList}}" display-field="label" value-field="data"></sc-combobox-column>
                <sc-data-column data-field="oemNm" header-text="OEM" width="120" editable="true"></sc-data-column>
                <sc-combobox-column data-field="prodGrp" header-text="제품군" width="100" editable="true" items="{{codes.prodGrpList}}" display-field="label" value-field="data"></sc-combobox-column>
                <sc-group-column header-text="견적원가 정보" width="200">
                    <sc-data-column data-field="ecPjtCd" header-text="견적코드" width="100" editable="false"></sc-data-column>
                    <sc-image-column data-field="btnSelectEc" header-text="조회" width="50" image-cls="search" singular-source="true" on-item-click="onShowEcPopup"></sc-image-column>
                </sc-group-column>
            </sc-grid-columns>
        </sc-grid>
    </template>
    <script>
        Polymer({
            is: 'es-target-cost-project-list',
            properties: {
                searchParam: { type: Object, value: function() { return {}; } },
                resultList: { type: Array, value: function() { return []; } },
                codes: { 
                    type: Object, 
                    value: function() { 
                        return { 
                            bizUnitList: [ {label: 'PT', data: 'PT'}, {label: 'SEAT', data: 'SEAT'} ],
                            prodGrpList: [ {label: 'T/M', data: 'TM'}, {label: 'AXLE', data: 'AXLE'} ]
                        }; 
                    } 
                }
            }
        });
    </script>
</dom-module>