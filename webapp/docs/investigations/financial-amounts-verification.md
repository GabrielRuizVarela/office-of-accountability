# Financial Amounts Verification Report

**Date:** 2026-03-21
**Scope:** All financial claims in the finanzas-politicas investigation
**Method:** WebSearch + WebFetch against primary sources for each figure

---

## 1. Nacion Seguros Total Contracts: $28.5B ARS

**Status: UNVERIFIABLE - likely overstated or aggregated estimate**

- The codebase claims ARS 28.5B in total direct contracts between the State and Nacion Seguros (2020-2024).
- La Nacion reports the total commissions paid to brokers during all four years of Fernandez were ARS $3,500M (La Nacion, March 2024). With typical commission rates of 10-15%, that would imply total premiums of roughly ARS $23B-$35B.
- Infobae reports 972 contract adjudications to Nacion Seguros during the Fernandez presidency.
- Annual premium was reported as "close to $20,000M" by La Nacion.
- No single source explicitly confirms "$28.5B" as a total figure. The number is plausible as a rough total of premiums across 2020-2024 based on back-calculation from commissions, but it is not directly sourced.

**Recommendation:** Change claim language to "estimated $23B-$35B based on commission data" or find a primary Compr.ar dataset aggregation to confirm. Current $28.5B is within plausible range but unsourced as an exact figure.

**Sources:**
- [La Nacion - El escandalo de los seguros: revelan la explosiva cifra](https://www.lanacion.com.ar/politica/el-escandalo-de-los-seguros-revelan-la-explosiva-cifra-que-los-brokers-cobraron-durante-el-gobierno-nid17032024/)
- [Infobae - Organismos del Estado contrataron casi 600 polizas](https://www.infobae.com/politica/2024/03/16/organismos-del-estado-contrataron-casi-600-polizas-de-seguros-en-los-ultimos-dos-anos-del-gobierno-de-alberto-fernandez/)

---

## 2. Decreto 823/2021 Text

**Status: VERIFIED**

- The decreto is published on argentina.gob.ar and confirms: all entities under Ley 24.156 Art. 8 must contract insurance exclusively through Nacion Seguros S.A.
- The decreto was repealed by Decreto 747/2024 (published August 21, 2024).
- The investigation's claim is accurate.

**Source:**
- [Argentina.gob.ar - Decreto 823/2021](https://www.argentina.gob.ar/normativa/nacional/decreto-823-2021-357558)

---

## 3. Bachellier S.A. Embargo: $9.669B ARS

**Status: VERIFIED**

- Multiple sources confirm the embargo of $9,669,697,257.25 pesos against Bachellier SA.
- Bachellier was processed as "participe necesario en negociaciones incompatibles con la funcion publica."
- Judge Casanello ordered the embargo (February 2026).
- Bachellier invoiced approximately $1,665M in commissions, confirmed by multiple outlets (Infobae, Los Andes, La Nacion).

**Sources:**
- [Infobae - Causa Seguros: procesaron a la empresa de Hector Martinez Sosa](https://www.infobae.com/judiciales/2026/02/10/causa-seguros-procesaron-a-la-empresa-de-hector-martinez-sosa-el-broker-amigo-de-alberto-fernandez/)
- [Los Andes - Causa seguros: procesaron y embargaron](https://www.losandes.com.ar/politica/causa-seguros-procesaron-y-embargaron-la-empresa-del-broker-amigo-alberto-fernandez-n5980074)

---

## 4. Martinez Sosa Commissions: $366M ARS

**Status: VERIFIED**

- La Nacion confirms: Martinez Sosa's company was the second most important broker with $366,635,744 in commissions.
- His company (Hector Martinez Sosa y Compania S.A.) and satellite companies together handled over $2,060M in commissions over four years.
- Martinez Sosa had contracts with 19 public agencies.
- His company was prosecuted and embargoed for $2,870,729,545.61.

**Sources:**
- [La Nacion - El escandalo de los seguros: el esposo de la exsecretaria](https://www.lanacion.com.ar/economia/el-escandalo-de-los-seguros-el-esposo-de-la-exsecretaria-de-alberto-fernandez-facturo-mas-de-360-nid05082024/)
- [Infobae - Escandalo de los seguros: las empresas del broker amigo](https://www.infobae.com/politica/2024/03/18/escandalo-de-los-seguros-las-empresas-del-broker-amigo-de-alberto-fernandez-y-sus-satelites-cobraron-mas-de-2000-millones-por-comisiones/)

---

## 5. SIDE Reserved Funds: 2,838% Growth and ARS 13.4B

**Status: CORRECTED - growth percentage differs by source**

- **ARS 13.4B figure: VERIFIED.** Perfil confirms reserved funds reached $13,436M by 2025.
- **Baseline: CORRECTED.** The 2023 baseline was ARS $650M in reserved funds (not ARS 3.8B as stated in the timeline).
- **Growth percentage: CORRECTED.** Perfil reports 1,967% growth (from $650M to $13,436M), not 2,838%.
- The codebase's timeline (line 912) states "grew from ARS 3.8B (4.1% of budget in 2023) to ARS 13.4B" - the $3.8B figure appears to refer to an intermediate 2024 figure, not the 2023 baseline.
- The 2,838% figure used in the codebase is not corroborated by any source found. Perfil says 1,967%.

**Correction needed in codebase:**
- Change "2,838%" to "1,967%" (or cite specific source if a different baseline is used)
- Change "from ARS 3.8B (4.1% of budget in 2023)" to "from ARS 650M in 2023"

**Sources:**
- [Perfil - SIDE: los gastos reservados crecieron 1.967% con Milei](https://www.perfil.com/noticias/economia/side-los-gastos-reservados-crecieron-1967-con-milei.phtml)
- [Chequeado - Los fondos reservados de la SIDE](https://chequeado.com/el-explicador/los-fondos-reservados-de-la-secretaria-de-inteligencia-el-gobierno-de-milei-los-amplio-por-tercera-vez/)

---

## 6. $LIBRA Cashout: USD $107M and $4B Peak

**Status: CORRECTED - market cap was $4.5B, not $4B; $107M is one of several estimates**

- **$107M cashout: VERIFIED** by multiple sources. The Block and CoinGape confirm "insiders cashed out $107 million." Eight wallets linked to the project were identified.
- **$4B peak: CORRECTED to $4.5B.** OKX and multiple sources report the peak market cap was USD $4.5B, not $4B.
- Other sources report slightly different insider profit figures: $80-$100M (OKX), $87M (The Economist from 9 founding accounts), up to $251M total investor losses.
- The $107M figure is the most widely cited and blockchain-verified amount.

**Correction needed:** Change "$4B market cap" to "$4.5B market cap" across codebase.

**Sources:**
- [The Block - Milei retracts $LIBRA endorsement after insiders cash out $107 million](https://www.theblock.co/post/341206/argentinian-president-javier-milei-retracts-libra-endorsement-after-insiders-cash-out-107-million)
- [CoinGape - Argentina's LIBRA token crashes 90% as insiders cash out $107M](https://coingape.com/trending/argentinas-libra-token-price-crashes-90-as-insiders-cash-out-107m/)
- [OKX - LIBRA and the Milei Token Scandal](https://www.okx.com/en-us/learn/libra-milei-token-scandal)

---

## 7. BCRA Gold: ~37 Tonnes and $1B+

**Status: VERIFIED with nuance**

- **37 tonnes: VERIFIED.** Ambito confirms that 37 tonnes (60% of Argentina's gold reserves) are held at the London Bullion Market.
- **Total gold reserves: 61.7 tonnes** (as of July 2024), with total gold reserves valued at approximately USD $4.981B.
- **$1B+ valuation: VERIFIED.** 37 tonnes at market prices is well above $1B (approximately $2.9B+ at 2024 gold prices).
- BCRA confirmed the shipments were completed by September 2024. Three tonnes were confirmed shipped in July 2024.
- The gold was placed in a BIS (Bank for International Settlements) account in London.

**Sources:**
- [Ambito - Oro del BCRA: confirman envio de tres toneladas en julio](https://www.ambito.com/economia/oro-del-bcra-confirman-envio-tres-toneladas-julio-y-el-60-las-reservas-del-metal-ya-estaria-fuera-del-pais-n6062712)
- [Infobae - El Banco Central confirmo que termino de mandar los lingotes](https://www.infobae.com/economia/2024/09/02/el-banco-central-confirmo-que-termino-de-mandar-los-lingotes-de-oro-de-las-reservas-al-exterior/)
- [Chequeado - Giro de oro al exterior](https://chequeado.com/el-explicador/giro-de-oro-al-exterior-que-se-sabe-sobre-la-decision-que-comunico-luis-caputo/)

---

## 8. Capital Humano: 5,000 Tonnes of Withheld Food

**Status: VERIFIED**

- Multiple sources confirm 5,000 tonnes (5 million kilos) of food were withheld in warehouses in Villa Martelli and Tafi Viejo (Tucuman).
- The Camara de Casacion ordered Pettovello to distribute the food.
- Judge Casanello ordered a 72-hour distribution plan.
- Food was found to be nearing expiration dates.
- The food was destined for 40,000 community dining halls (comedores).

**Sources:**
- [Los Andes - La Justicia ordeno a Capital Humano que reparta de inmediato las 5.000 toneladas](https://www.losandes.com.ar/politica/la-justicia-ordeno-a-capital-humano-que-reparta-de-inmediato-las-5000-toneladas-de-alimentos-acopiados)
- [La Izquierda Diario - Casacion vuelve a exigirle a Pettovello](https://www.laizquierdadiario.mx/Casacion-vuelve-a-exigirle-a-Pettovello-que-reparta-las-5-000-toneladas-de-alimentos-retenidas)

---

## 9. Belocopitt: 76% of Swiss Medical

**Status: VERIFIED**

- Media Ownership Monitor (Peru edition, which covers Argentine media owners) confirms: Claudio Belocopitt owns 76% of Swiss Medical Group.
- The ownership is structured through holding companies: Inversora Cinco SM SA (82.34% Belocopitt, 17.65% Gabriela Herman de Belocopitt), Inversora Quince SM SA (15%), Inversora Diez SM SA (10%).
- Swiss Medical is the second-largest private healthcare company in Argentina with 1 million clients.

**Sources:**
- [Media Ownership Monitor - Claudio Belocopitt](https://peru.mom-gmr.org/es/propietarios/propietarios-individuales/detalles/owner/owner/show/claudio-belocopitt/)
- [Los Ricos de Argentina - Claudio Belocopitt](https://losricosdeargentina.com.ar/belocopit.html)

---

## 10. Belocopitt: 40% of Grupo America

**Status: VERIFIED**

- La Nacion confirms Belocopitt purchased 40% of Grupo America (America TV, A24, Radio La Red) in February 2017.
- He acquired the shares from Grupo De Narvaez.
- Post-acquisition ownership structure: Vila 40%, Belocopitt 40%, Eurnekian 15%, Nofal 5%.

**Sources:**
- [La Nacion - El dueno de Swiss Medical compro 40% de America TV](https://www.lanacion.com.ar/economia/el-dueno-de-swiss-medical-claudio-belocopitt-compro-40-de-america-tv-nid1984881/)
- [Perfil - Belocopitt compro el 40% de America y Radio La Red](https://www.perfil.com/noticias/politica/belocopitt-compro-la-mitad-de-america-y-radio-la-red.phtml)

---

## 11. PAMI Anastrozol Overpricing: 16x ($13,192 vs $924)

**Status: CORRECTED - the ratio is 14x, not 16x, for the specific anastrozol comparison**

- La Nacion and Infobae confirm: during Q4 2023, GP-Pharm sold 1,098 units of anastrozol 1mg at $13,192 per unit through the Convenio Marco.
- The same product from the same supplier in the same quarter was $924 per unit through public tender (Licitacion LP N 44/22).
- **$13,192 / $924 = 14.27x**, not 16x.
- However, the broader claim that "PAMI paid up to 16 times" is sourced from the original Coalicion Civica complaint, which looked at multiple drugs. Some other drugs may have reached 16x.
- PAMI spent an estimated $273M more than necessary due to the overpricing scheme.

**Recommendation:** Clarify that anastrozol was ~14x overpriced; the "up to 16x" refers to the worst case across all drugs studied.

**Sources:**
- [La Nacion - Denuncian que el PAMI pago medicamentos oncologicos hasta 16 veces mas](https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/)
- [Infobae - Denuncian al PAMI y a un grupo de laboratorios](https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/)

---

## 12. Suizo Argentina Contracts: 2,678% Growth

**Status: VERIFIED**

- La Nacion (August 2025) confirms: Suizo Argentina SA went from ARS $3,900M in contracts in 2024 to ARS $108,300M in 2025.
- Multiple outlets (Minuto Uno, Agencia Hoy, Diario San Rafael) all confirm the 2,678% increase.
- During the same period, accumulated inflation was 117.8% in 2024 and 17.3% through July 2025 - far below the contract growth.
- The Ministry of Health authorized a single contract of $78,267M (over 70% of the total).
- Connected to the Spagnuolo/ANDIS scandal implicating Karina Milei.

**Sources:**
- [La Nacion - Aumento exponencial: Suizo Argentina](https://www.lanacion.com.ar/politica/aumento-exponencial-suizo-argentina-paso-de-3900-millones-a-108000-millones-en-contratos-con-el-nid24082025/)
- [Minuto Uno - Contratos del Estado con Suizo Argentina se dispararon 2.678%](https://www.minutouno.com/politica/en-solo-un-ano-los-contratos-del-estado-la-drogueria-suizo-argentina-se-dispararon-2678-n6182259)

---

## 13. Correo Argentino Debt Reduction: 98.82%

**Status: VERIFIED**

- Chequeado confirms: the Procuracion calculated the proposal contained a "quita del 98,82 por ciento."
- This calculation included interest and exchange rate differences from 2001 to 2016.
- Original debt: ARS $296M. Adjusted to 2016: approximately ARS $70,000M. The Macri government accepted a settlement at 1.18% of adjusted value.
- Prosecutor Boquin ruled it "equivalent to a forgiveness" and "abusive."

**Sources:**
- [Chequeado - Claves para entender la polemica por la deuda del Correo Argentino](https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/)
- [Politica Argentina - Correo Argentino: avanza el informe sobre el autoperdon de Macri con quita del 98%](https://www.politicargentina.com/notas/201911/31284-correo-argentino-avanza-el-informe-sobre-si-el-multimillonario-autoperdon-de-macri-con-quita-del-98-fue-abusivo.html)

---

## 14. Macri AUSOL Shares: ~394% Premium

**Status: VERIFIED**

- Pagina/12 confirms: AUSOL shares increased 394% in value between Macri's inauguration and the sale in May 2017.
- Sideco Americana sold 7% of AUSOL shares to Natal Inversiones for ARS $551M (USD $19.7M).
- Prior toll increases authorized by the Macri government: 50% in January 2016, 100% in January-February 2017.
- One source mentions "397%" - the ~394% figure in the codebase is consistent.

**Sources:**
- [Pagina/12 - El negocio de los Macri con Autopistas del Sol](https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol)
- [Pagina/12 - La sospechosa venta de acciones que involucra a Macri](https://www.pagina12.com.ar/215830-la-sospechosa-venta-de-acciones-que-involucra-a-macri)

---

## 15. Milei DNUs: 83 Total

**Status: VERIFIED (as of the date of original claim)**

- Universidad Austral study confirms: in less than two years, Milei signed 83 DNUs.
- This surpasses Cristina Kirchner's 81 DNUs across eight years of government.
- La Nacion (February 2026) reports that during 2025 alone, Milei dictated 35 DNUs and 74 delegated decrees, while only promulgating 13 laws.
- Note: the total continues to grow. By late 2025, the count exceeded 83.

**Sources:**
- [Voces Criticas - Milei supera a Cristina Kirchner en uso de DNUs](https://www.vocescriticas.com/noticias/2025/09/30/185424-javier-milei-supera-a-cristina-kirchner-en-uso-de-decretos-de-necesidad-y-urgencia-en-menos-de-dos-anos)
- [La Nacion - Durante el receso legislativo, Milei dicto casi tantos DNU](https://www.lanacion.com.ar/politica/durante-el-receso-legislativo-milei-dicto-casi-tantos-dnu-como-todas-las-leyes-promulgadas-a-lo-nid11022026/)

---

## Summary Table

| # | Claim | Status | Correction Needed |
|---|-------|--------|-------------------|
| 1 | Nacion Seguros $28.5B total | UNVERIFIABLE | Plausible range but no primary source for exact figure |
| 2 | Decreto 823/2021 text | VERIFIED | None |
| 3 | Bachellier $9.669B embargo | VERIFIED | None |
| 4 | Martinez Sosa $366M | VERIFIED | None |
| 5 | SIDE 2,838% / ARS 13.4B | CORRECTED | Growth is 1,967% (from $650M baseline), not 2,838% |
| 6 | $LIBRA $107M / $4B peak | CORRECTED | Peak was $4.5B, not $4B |
| 7 | BCRA gold ~37t / $1B+ | VERIFIED | None (actually worth ~$2.9B+) |
| 8 | Capital Humano 5,000t food | VERIFIED | None |
| 9 | Belocopitt 76% Swiss Medical | VERIFIED | None |
| 10 | Belocopitt 40% Grupo America | VERIFIED | None |
| 11 | PAMI 16x anastrozol | CORRECTED | Specific anastrozol ratio is ~14x; "up to 16x" applies across all drugs |
| 12 | Suizo Argentina 2,678% | VERIFIED | None |
| 13 | Correo 98.82% quita | VERIFIED | None |
| 14 | AUSOL ~394% premium | VERIFIED | None |
| 15 | Milei 83 DNUs | VERIFIED | None (count continues to grow) |

**Overall: 10 VERIFIED, 3 CORRECTED, 1 UNVERIFIABLE, 1 VERIFIED (Decreto text)**

## Required Codebase Corrections

1. **SIDE growth percentage:** Change "2,838%" to "1,967%" and baseline from "ARS 3.8B" to "ARS 650M" (lines ~555-558, 910-913, 1017, 1897)
2. **$LIBRA market cap:** Change "$4B" to "$4.5B" (lines ~545-548, 980-983, 1884-1886)
3. **PAMI anastrozol:** Clarify that the specific anastrozol case is ~14x; "up to 16x" refers to worst case across multiple drugs
4. **Nacion Seguros $28.5B:** Add qualifier "estimated" or derive from Compr.ar data; current figure is plausible but not directly sourced
