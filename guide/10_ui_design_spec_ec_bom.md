# [As-you-Cost] 견적BOM 관리 화면 UI/UX 구현 명세 및 Skeleton Code

본 문서는 견적원가(EC) 프로세스의 핵심인 '견적BOM 작성 및 단가 산정' 화면에 대한 표준 UI 구조입니다. BOM 데이터는 계층형(Tree) 구조를 가지므로 반드시 Tree Grid 속성을 사용해야 합니다.

## 1. 견적BOM 조회 및 엑셀 업로드 화면 (`es-ec-bom-list.html`)

### 📌 화면 요구사항 분석
* 좌측에는 선택된 '프로젝트 기본 정보'가 폼 형태로 표시되고, 우측(또는 하단)에 BOM 데이터를 제어하는 그리드가 배치됩니다.
* 수백 개의 부품을 수기 입력하기 어려우므로 **'엑셀 업로드'** 및 **'엑셀 다운로드'** 기능이 필수입니다.
* 그리드는 트리 구조(Tree Grid)로 표현되어야 하며, 상위/하위 품목 간의 Level 관계가 직관적으로 보여야 합니다.
* 각 부품(Part)별로 '기존 단가(C/Over)' 또는 '신규 산정 단가'를 입력받고, '수량'을 곱해 '재료비'가 자동 계산되어야 합니다.

### 💻 HTML Skeleton Code (Polymer 1.6)
```html
<dom-module id="es-ec-bom-list">
    <template>
        <sc-panel title-text="프로젝트 기본 정보" collapsible="true">
            <table class="tb-form">
                <colgroup>
                    <col style="width:120px"/>
                    <col/>
                    <col style="width:120px"/>
                    <col/>
                </colgroup>
                <tr>
                    <th><sc-label text="프로젝트 코드"></sc-label></th>
                    <td><sc-text-field value="{{pjtInfo.pjtCd}}" readonly="true"></sc-text-field></td>
                    <th><sc-label text="프로젝트명"></sc-label></th>
                    <td><sc-text-field value="{{pjtInfo.pjtNm}}" readonly="true"></sc-text-field></td>
                </tr>
            </table>
        </sc-panel>

        <sc-grid id="gridPanel" data-provider="{{resultList}}" is-tree="true" class="flex">
            <sc-toolbar>
                <sc-button text="조회" on-click="onFindList" auth-code="V"></sc-button>
                <sc-button text="엑셀업로드" on-click="onUploadExcel" auth-code="S"></sc-button>
                <sc-button text="엑셀다운로드" on-click="onDownloadExcel" auth-code="V"></sc-button>
                <span class="vt-seperator"></span>
                <sc-button text="행추가" on-click="onAddRow" auth-code="S"></sc-button>
                <sc-button text="삭제" on-click="onDeleteList" auth-code="S"></sc-button>
                <sc-button text="저장" on-click="onSaveList" auth-code="S"></sc-button>
                <sc-button text="재료비 집계" on-click="onCalculateCost" auth-code="S"></sc-button>
            </sc-toolbar>
            
            <sc-grid-columns>
                <sc-data-column data-field="itemNm" header-text="품목명" width="250" text-align="left" editable="true"></sc-data-column>
                <sc-data-column data-field="itemCd" header-text="품번" width="150" editable="true"></sc-data-column>
                <sc-data-column data-field="lvl" header-text="Level" width="60" text-align="center" data-type="number"></sc-data-column>
                <sc-data-column data-field="qty" header-text="수량" width="80" text-align="right" data-type="number" editable="true"></sc-data-column>
                <sc-data-column data-field="unitPrice" header-text="단가(원)" width="120" text-align="right" data-type="number" format-type="amt" editable="true"></sc-data-column>
                <sc-data-column data-field="matCost" header-text="재료비" width="120" text-align="right" data-type="number" format-type="amt" editable="false"></sc-data-column>
                <sc-checkbox-column data-field="newPartYn" header-text="신규부품 여부" width="100" checked-value="Y" un-checked-value="N" editable="true"></sc-checkbox-column>
            </sc-grid-columns>
            
            <sc-grid-fields>
                <sc-grid-field data-field="upItemCd"></sc-grid-field> </sc-grid-fields>
        </sc-grid>
    </template>
    <script>
        Polymer({
            is: 'es-ec-bom-list',
            properties: {
                pjtInfo: { type: Object, value: function() { return {}; } },
                resultList: { type: Array, value: function() { return []; } }
            }
            // ... (엑셀 업로드 파싱, 부모-자식 트리 구조 변환 로직 구현 필요)
        });
    </script>
</dom-module>