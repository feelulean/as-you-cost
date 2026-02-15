# [As-you-Cost] 견적기준가 취합 및 수익성 분석(WACC) 화면 UI/UX 구현 명세

본 문서는 EC05, EC06 프로세스를 위한 견적원가 마감 및 수익성 분석 화면의 표준 UI 구조입니다. 좌측에는 프로젝트 목록을, 우측에는 원가 요약 및 WACC 입력 폼을 배치하는 Split(분할) 레이아웃을 사용합니다.

## 1. 수익성 분석 및 WACC 산출 화면 (`es-ec-profit-mgt.html`)

### 📌 화면 요구사항 분석
* 화면을 2분할하여 좌측은 프로젝트 검색 및 그리드(`flex-4`), 우측은 상세 폼(`flex-6`)으로 구성합니다.
* **견적기준가 요약 폼:** 앞서 산출된 '재료비'를 BOM에서 끌어오고(Read-only), 노무비/제조경비/판관비 등을 입력받아 '총 견적원가'를 합산합니다.
* **수익성 Factor 폼:** 타인자본비용(Kd), 법인세율(t), 부채(B), 자본(S), 무위험이자율(Rf), 시장기대수익률(E(Rm)), 베타(Beta) 값을 입력받습니다.
* **WACC 계산:** 입력된 Factor를 기반으로 프론트엔드(JS)에서 실시간으로 자본비용 산출 공식(CAPM, WACC)을 적용하여 결과값을 표시해야 합니다.

### 💻 HTML Skeleton Code (Polymer 1.6)
```html
<dom-module id="es-ec-profit-mgt">
    <template>
        <sc-search-container on-search="onFindList" auth-code="V">
            <table>
                <colgroup><col style="width:120px"/><col/></colgroup>
                <tr>
                    <th><sc-label text="프로젝트 코드"></sc-label></th>
                    <td><sc-text-field value="{{searchParam.pjtCd}}" on-enter="onFindList"></sc-text-field></td>
                </tr>
            </table>
        </sc-search-container>

        <div class="hbox flex">
            <sc-grid id="gridPanel" data-provider="{{resultList}}" on-item-click="onProjectClick" class="flex-4" use-state="false">
                <sc-grid-columns>
                    <sc-data-column data-field="pjtCd" header-text="프로젝트 코드" width="120" text-align="center"></sc-data-column>
                    <sc-data-column data-field="pjtNm" header-text="프로젝트명" width="200" text-align="left"></sc-data-column>
                </sc-grid-columns>
            </sc-grid>

            <div class="hspace-10"></div>

            <div class="vbox flex-6">
                <sc-toolbar>
                    <sc-button text="재료비 취합(BOM)" on-click="onAggregateMaterialCost" auth-code="S"></sc-button>
                    <sc-button text="WACC 계산" on-click="onCalculateWacc" auth-code="V"></sc-button>
                    <sc-button text="저장" on-click="onSaveProfitData" auth-code="S"></sc-button>
                </sc-toolbar>

                <sc-panel title-text="견적기준가 (표준원가) 요약" class="flex-5">
                    <table class="tb-form">
                        <colgroup><col style="width:150px"/><col/><col style="width:150px"/><col/></colgroup>
                        <tr>
                            <th><sc-label text="재료비 (BOM 연계)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.matCost}}" format-type="amt" readonly="true"></sc-number-field></td>
                            <th><sc-label text="노무비"></sc-label></th>
                            <td><sc-number-field value="{{profitData.laborCost}}" format-type="amt"></sc-number-field></td>
                        </tr>
                        <tr>
                            <th><sc-label text="제조경비/감가상각비"></sc-label></th>
                            <td><sc-number-field value="{{profitData.mfgCost}}" format-type="amt"></sc-number-field></td>
                            <th><sc-label text="판관비"></sc-label></th>
                            <td><sc-number-field value="{{profitData.sgaCost}}" format-type="amt"></sc-number-field></td>
                        </tr>
                        <tr>
                            <th><sc-label text="총 견적원가"></sc-label></th>
                            <td colspan="3"><sc-number-field value="{{profitData.totalEstmCost}}" format-type="amt" readonly="true"></sc-number-field></td>
                        </tr>
                    </table>
                </sc-panel>

                <sc-panel title-text="수익성 분석 Factor (WACC)" class="flex-5">
                    <table class="tb-form">
                        <colgroup><col style="width:150px"/><col/><col style="width:150px"/><col/></colgroup>
                        <tr>
                            <th><sc-label text="타인자본비용 (Kd, %)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.kdRate}}"></sc-number-field></td>
                            <th><sc-label text="법인세율 (t, %)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.taxRate}}"></sc-number-field></td>
                        </tr>
                        <tr>
                            <th><sc-label text="부채 (B)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.debtAmt}}" format-type="amt"></sc-number-field></td>
                            <th><sc-label text="자기자본 (S)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.equityAmt}}" format-type="amt"></sc-number-field></td>
                        </tr>
                        <tr>
                            <th><sc-label text="무위험이자율 (Rf, %)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.rfRate}}"></sc-number-field></td>
                            <th><sc-label text="시장기대수익률 (E(Rm), %)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.ermRate}}"></sc-number-field></td>
                        </tr>
                        <tr>
                            <th><sc-label text="베타 (Beta)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.betaVal}}"></sc-number-field></td>
                            <th><sc-label text="WACC (%)"></sc-label></th>
                            <td><sc-number-field value="{{profitData.waccRate}}" readonly="true" class="font-bold"></sc-number-field></td>
                        </tr>
                    </table>
                </sc-panel>
            </div>
        </div>
    </template>
    <script>
        Polymer({
            is: 'es-ec-profit-mgt',
            properties: {
                searchParam: { type: Object, value: function() { return {}; } },
                resultList: { type: Array, value: function() { return []; } },
                profitData: { type: Object, value: function() { return {}; } }
            }
            // ... (WACC 수식 연산 및 BOM 재료비 집계 통신 로직)
        });
    </script>
</dom-module>