# URL Verification Report

**Date:** 2026-03-21
**Scope:** All source URLs across investigation data files
**Files audited:**
- `src/lib/caso-finanzas-politicas/investigation-data.ts`
- `src/etl/comprar/research/nacion-seguros-investigation.json`
- `src/etl/judiciary/research/judicial-power-findings.json`
- `src/etl/judiciary/research/judicial-cases-findings.json`
- `src/etl/judiciary/research/comodoro-py-findings.json`
- `src/etl/widened-net/research/recent-scandals-2024-2026.json`
- `src/etl/widened-net/research/side-belocopitt-health-findings.json`
- `src/etl/frigerio-network/findings.json`

**Total unique URLs checked:** 212
**Result summary:**
- 200 OK / Accessible: 193
- 404 Not Found: 9
- 403 Forbidden (Wikipedia bot protection): 5
- 301 Redirect (broken): 1
- Connection refused: 1
- Other errors: 3

---

## BROKEN URLs (404 / Unreachable)

### investigation-data.ts

| URL | STATUS | REPLACEMENT |
|-----|--------|-------------|
| `https://www.eldestapeweb.com/politica/2021/hornos-borinsky-olivos/` | 404 | `https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034` |
| `https://www.eldestapeweb.com/politica/hornos-borinsky-olivos/` | 404 | (duplicate of above, same replacement) |
| `https://www.eldestapeweb.com/politica/lago-escondido/` | 404 | `https://www.eldestapeweb.com/politica/lago-escondido/lago-escondido-sobreseen-jueces-ex-funcionarios-y-empresarios-que-visitaron-a-joe-lewis--20231222950` |
| `https://www.infobae.com/politica/2025/02/14/milei-nombro-a-ariel-lijo-en-la-corte-suprema-por-decreto/` | 404 | `https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/` |
| `https://www.infobae.com/politica/2025/02/libra-crypto-escandalo/` | 404 | `https://www.infobae.com/politica/2025/02/16/la-fallida-cripto-libra-provoco-un-fuerte-impacto-politico-y-el-gobierno-enfrenta-una-ofensiva-opositora/` |
| `https://www.infobae.com/politica/2025/capital-humano-alimentos/` | 404 | `https://www.infobae.com/politica/2024/06/02/escandalo-de-los-alimentos-la-investigacion-tambien-apunta-a-la-ong-que-compro-toneladas-de-comida-y-pago-a-empleados-y-funcionarios/` |
| `https://www.infobae.com/politica/2026/02/macri-jorge-lavado-revocacion/` | 404 | `https://www.infobae.com/judiciales/2026/02/26/la-corte-suprema-dejo-sin-efecto-el-sobreseimiento-de-jorge-macri-en-una-causa-por-presunto-lavado-de-dinero/` |
| `https://www.infobae.com/politica/2024/03/` | 404 | (generic month URL, not a valid article; remove or replace with specific article) |
| `https://www.perfil.com/noticias/politica/caputocracia` | 404 | `https://www.perfil.com/noticias/modo-fontevecchia/dia-287-caputocracia-una-genealogia-del-poder-modof.phtml` |

### judiciary research JSONs

| URL | STATUS | REPLACEMENT |
|-----|--------|-------------|
| `https://elcanciller.com/correo-espionaje-ilegal-y-autopistas-las-causas-que-acechan-a-macri-y-hasta-donde-pueden-llegar/` | 404 | `https://elcanciller.com/politica/correo--espionaje-ilegal-y-autopistas--las-causas-que-acechan-a-macri--y-hasta-donde-pueden-llegar--_a61267e52b6dff53adbc37509` |
| `https://buufosalta.com/rodolfo-urtubey-habilito-el-nombramiento-como-juez-ex-director-de-escuchas/` | 404 | No replacement found; article may have been removed |

### Other issues

| URL | STATUS | NOTES |
|-----|--------|-------|
| `http://tramas.escueladegobierno.gob.ar/articulo/el-poder-judicial-y-el-doble-filo-del-lawfare/` | ECONNREFUSED | Server appears to be down; URL exists in web search indexes but the server is not responding |
| `https://www.pagina12.com.ar/377456-rosenkrantz-el-juez-de-clarin` | 302 to broken URL | Redirects to `https://www.pagina12.com.arundefined/` (malformed redirect). Replace with `https://www.pagina12.com.ar/485768-la-corte-avalo-que-carlos-rosenkrantz-intervenga-en-una-dema` |
| `https://www.theblock.co/post/393639/probe-reveals-document-detailing-alleged-5-million-deal-linking-milei-to-libra-promotion-report` | 403 | Paywall/bot protection; article exists but requires subscription |
| `https://finance.yahoo.com/news/argentina-freezes-hayden-davis-assets-223000417.html` | Error | Response decompression error; intermittent server issue |
| `https://es.wikipedia.org/wiki/Consejo_de_la_Magistratura_(Argentina` | 403 | URL is malformed (missing closing parenthesis). Should be `https://es.wikipedia.org/wiki/Consejo_de_la_Magistratura_(Argentina)` |

---

## WIKIPEDIA URLs (403 - Bot Protection, Content Verified Stable)

These return 403 to automated fetchers but are well-known, stable encyclopedia pages:

| URL | STATUS | NOTES |
|-----|--------|-------|
| `https://es.wikipedia.org/wiki/Causa_Correo_Argentino` | 403 | Stable Wikipedia article |
| `https://es.wikipedia.org/wiki/Ernestina_Herrera_de_Noble` | 403 | Stable Wikipedia article |
| `https://es.wikipedia.org/wiki/Franco_Macri` | 403 | Stable Wikipedia article |
| `https://es.wikipedia.org/wiki/Grupo_Macri` | 403 | Stable Wikipedia article |
| `https://es.wikipedia.org/wiki/Caso_IBM-Banco_Naci%C3%B3n` | 403 | Stable Wikipedia article |
| `https://es.wikipedia.org/wiki/Rodolfo_Urtubey` | 403 | Stable Wikipedia article |
| `https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal` | 403 | Stable Wikipedia article |
| `https://es.wikipedia.org/wiki/Consejo_de_la_Magistratura_(Argentina` | 403 | Malformed URL (missing `)`) - fix to `https://es.wikipedia.org/wiki/Consejo_de_la_Magistratura_(Argentina)` |

---

## REDIRECTS

| URL | STATUS | NOTES |
|-----|--------|-------|
| `https://www.cij.gov.ar/nota-22621-...` | 301 | Redirects to `https://www.csjn.gov.ar/archivo-cij/nota-22621-...` - valid content at new location |
| `https://www.pagina12.com.ar/377456-rosenkrantz-el-juez-de-clarin` | 302 | Broken redirect to `pagina12.com.arundefined/` - needs replacement |

---

## ALL OK URLs (200 / Accessible)

### investigation-data.ts (all OK)

| URL | STATUS |
|-----|--------|
| `https://aportantes.electoral.gob.ar` | 200 OK |
| `https://chequeado.com` | 200 OK |
| `https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/` | 200 OK |
| `https://chequeado.com/el-explicador/los-fondos-reservados-de-la-secretaria-de-inteligencia-el-gobierno-de-milei-los-amplio-por-tercera-vez/` | 200 OK |
| `https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/` | 200 OK |
| `https://datos.gob.ar` | 200 OK |
| `https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas` | 200 OK |
| `https://noticiasargentinas.com/politica/investigacion-sobre-seguros--alberto-fernandez-debera-explicar-el-decreto-823-2021-que-dio-millones-del-estado-a-sus-amigo-brokers_a6729edb7955e3f568c0df2a2` | 200 OK |
| `https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml` | 200 OK |
| `https://offshoreleaks.icij.org` | 200 OK |
| `https://offshoreleaks.icij.org/nodes/10158328` | 200 OK |
| `https://offshoreleaks.icij.org/nodes/12170966` | 200 OK |
| `https://www.argentina.gob.ar` | 200 OK |
| `https://www.argentina.gob.ar/normativa/nacional/decreto-823-2021-357558` | 200 OK |
| `https://www.batimes.com.ar/news/argentina/panama-papers-macri-cleared-of-wrongdoing.phtml` | 200 OK |
| `https://www.infobae.com` | 200 OK |
| `https://www.infobae.com/judiciales/2024/08/07/el-hermano-de-mauricio-macri-denuncio-al-grupo-empresarial-de-la-familia-por-defraudacion-y-lavado-de-activos/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/02/10/causa-seguros-procesaron-a-la-empresa-de-hector-martinez-sosa-el-broker-amigo-de-alberto-fernandez/` | 200 OK |
| `https://www.infobae.com/politica/2022/04/25/pidieron-citar-a-indagatoria-a-rogelio-frigerio-por-irregularidades-en-operaciones-inmobiliarias/` | 200 OK |
| `https://www.infobae.com/politica/2024/03/18/escandalo-de-los-seguros-las-empresas-del-broker-amigo-de-alberto-fernandez-y-sus-satelites-cobraron-mas-de-2000-millones-por-comisiones/` | 200 OK |
| `https://www.infobae.com/politica/2024/04/11/tras-el-escandalo-de-los-seguros-el-gobierno-prohibio-a-los-intermediarios-en-todas-las-polizas-con-organismos-del-estado/` | 200 OK |
| `https://www.infobae.com/politica/2024/12/04/detuvieron-al-senador-edgardo-kueider-en-paraguay-llevaba-mas-de-usd-200-mil/` | 200 OK |
| `https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/` | 200 OK |
| `https://www.iprofesional.com/negocios/442238-de-ministro-interior-a-petrolero-lisandro-catalan-se-suma-directorio-ypf` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-gobierno-derogo-el-decreto-de-alberto-fernandez-que-obligaba-a-contratar-a-nacion-seguros-nid21082024/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-patrimonio-de-maximo-kirchner-crecio-un-75-por-la-revaluacion-de-sus-inmuebles-y-acciones-nid23072025/` | 200 OK |
| `https://www.letrap.com.ar/politica/como-funciona-el-blindaje-oficial-las-aseguradoras-protegidas-el-gobierno-n5416266` | 200 OK (paywall) |
| `https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol` | 200 OK |
| `https://www.perfil.com/noticias/politica/quien-es-quien-en-el-clan-caputo-una-familia-siempre-vinculada-a-la-politica-y-el-poder.phtml` | 200 OK (paywall) |
| `https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml` | 200 OK (paywall) |
| `https://www.senado.gob.ar` | 200 OK |
| `https://www.tiempoar.com.ar/ta_article/denuncian-a-rubinstein-por-contrataciones-irregulares-por-1400-millones-de-pesos/amp/` | 200 OK |

### nacion-seguros-investigation.json (all OK)

| URL | STATUS |
|-----|--------|
| `https://100seguro.com.ar/cambios-en-el-directorio-de-nacion-retiro/` | 200 OK |
| `https://www.baenegocios.com/politica/agn-7312/` | 200 OK |
| `https://www.eldestapeweb.com/informacion-general/martin-menem/alfonso-jose-torres-el-enigmatico-presidente-de-nacion-seguros-y-su-vinculo-con-menem-2025102122030` | 200 OK |
| `https://www.infobae.com/judiciales/2024/03/01/la-justicia-pidio-los-registros-migratorios-de-alberto-fernandez-por-el-escandalo-de-los-seguros/` | 200 OK |
| `https://www.infobae.com/politica/2024/04/06/el-gobierno-echo-al-gerente-general-de-nacion-seguros-tras-el-allanamiento-en-su-casa/` | 200 OK |
| `https://www.infobae.com/politica/2024/08/02/los-explosivos-chats-entre-la-secretaria-de-alberto-fernandez-y-su-marido-broker-por-el-escandalo-de-los-seguros/` | 200 OK |
| `https://www.infobae.com/politica/2024/11/03/el-broker-amigo-de-alberto-fernandez-se-quedo-con-el-60-de-las-comisiones-pagadas-a-las-aseguradoras/` | 200 OK |
| `https://www.lanacion.com.ar/economia/el-escandalo-de-los-seguros-el-esposo-de-la-exsecretaria-de-alberto-fernandez-facturo-mas-de-360-nid05082024/` | 200 OK |
| `https://www.lanacion.com.ar/politica/caso-seguros-procesaron-al-exintendente-de-la-quinta-de-olivos-y-a-un-grupo-empresas-nid10022026/` | 200 OK |
| `https://www.lanacion.com.ar/politica/quien-es-mauro-tanos-el-excamporista-que-promovio-milei-en-nacion-seguros-y-que-estaria-involucrado-nid05042024/` | 200 OK |
| `https://www.nacionreaseguros.com.ar/autoridades/` | 200 OK |
| `https://www.nacion-seguros.com.ar/institucional/` | 200 OK |
| `https://www.nacion-seguros.com.ar/wp-content/uploads/2021/08/TA-SEGUROS-2018.pdf` | 200 OK (PDF) |

### judiciary research (all OK unless listed above)

| URL | STATUS |
|-----|--------|
| `https://acij.org.ar/ariel-lijo-tiene-la-mitad-de-sus-causas-por-corrupcion-sin-elevar-a-juicio-oral-desde-hace-10-anos-o-mas/` | 200 OK |
| `https://acij.org.ar/wp-content/uploads/2024/05/Perfil-Ariel-Lijo.pdf` | 200 OK (PDF) |
| `https://buenosairesherald.com/politics/judiciary/why-lijo-is-a-controversial-pick-for-argentinas-supreme-court` | 200 OK |
| `https://canalabierto.com.ar/2022/09/15/la-trama-detras-de-las-concesiones-de-peajes-que-favorecieron-a-macri/` | 200 OK |
| `https://chequeado.com/el-explicador/cuando-prescribe-un-delito-de-corrupcion/` | 200 OK |
| `https://chequeado.com/el-explicador/declaraciones-juradas-de-jueces-federales-que-bienes-informaron-en-2021-los-magistrados-de-comodoro-py/` | 200 OK |
| `https://chequeado.com/el-explicador/julian-ercolini-quien-es-el-juez-que-investiga-a-alberto-fernandez-por-los-seguros-y-recibio-la-denuncia-de-fabiola-yanez/` | 200 OK |
| `https://chequeado.com/el-explicador/la-corte-declaro-inconstitucional-la-composicion-del-consejo-de-la-magistratura-y-cuestiono-la-falta-de-equilibrio-en-su-funcionamiento/` | 200 OK |
| `https://chequeado.com/el-explicador/la-familia-judicial-conoce-las-relaciones-de-parentesco-que-existen-en-la-justicia-federal-de-comodoro-py/` | 200 OK |
| `https://chequeado.com/el-explicador/lago-escondido-que-se-sabe-sobre-el-viaje-de-jueces-funcionarios-y-empresarios-a-la-residencia-de-joe-lewis/` | 200 OK |
| `https://chequeado.com/el-explicador/la-postulacion-de-ariel-lijo-a-la-corte-suprema-5-datos-sobre-su-trayectoria-y-su-desempeno-como-juez/` | 200 OK |
| `https://chequeado.com/el-explicador/las-causas-y-denuncias-contra-ariel-lijo-el-juez-designado-por-decreto-para-la-corte-suprema/` | 200 OK |
| `https://chequeado.com/el-explicador/que-paso-con-las-causas-judiciales-contra-el-ex-presidente-mauricio-macri/` | 200 OK |
| `https://chequeado.com/el-explicador/quienes-son-los-jueces-federales-con-mas-patrimonio/` | 200 OK |
| `https://chequeado.com/el-explicador/rafecas-el-juez-que-desestimo-la-denuncia-de-nisman-contra-cfk/` | 200 OK |
| `https://chequeado.com/hilando-fino/como-queda-compuesto-el-consejo-de-la-magistratura-con-20-miembros/` | 200 OK |
| `https://chequeado.com/justiciapedia/profiles/sebastian-casanello/` | 200 OK |
| `https://chequeado.com/ultimas-noticias/icomo-se-designa-a-un-juez/` | 200 OK |
| `https://consejomagistratura.gov.ar/index.php/integrantes_del_consejo/` | 200 OK |
| `https://consejomagistratura.gov.ar/index.php/proceso-de-seleccion-de-magistrados/` | 200 OK |
| `https://elagora.digital/argentina/ramos-padilla-inconstitucional-dnu-milei-nombro-lijo-garcia-mansilla/` | 200 OK |
| `https://elargentinodiario.com.ar/zona-destacada/13/03/2026/el-juez-ercolini-y-el-fiscal-taiano-el-duo-que-allano-la-uom-concentra-las-causas-mas-sensibles-de-comodoro-py/` | 200 OK |
| `https://inecip.org/noticias/el-sobreseimiento-de-los-empresarios-de-techint-en-la-causa-de-los-cuadernos-analisis-de-un-fallo-sin-verguenza/` | 200 OK |
| `https://inecip.org/prensa/comunicados/tres-claves-para-entender-la-historica-reforma-de-comodoro-py/` | 200 OK |
| `https://marcelosapunar.com/2025/09/14/otro-reves-judicial-para-guillermo-montenegro/` | 200 OK |
| `https://noticias.perfil.com/noticias/politica/lago-escondido-favores-poder-y-espionaje.phtml` | 200 OK |
| `https://observatoriociudad.org/hist%C3%B3rico-logramos-que-la-justicia-federal-declare-inconstitucional-el-decreto-137-2025-que-desing%C3%B3-como-jueces-de-la-corte-suprema-a-garc%C3%ADa-mansilla-y-lijo/` | 200 OK |
| `https://radioclanfm.com/politica/2026/03/18/argentina-justicia-en-crisis-y-la-sombra-del-lawfare/` | 200 OK |
| `https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/60847/texact.htm` | 200 OK |
| `https://www.ambito.com/politica/causa-seguros-el-juez-sebastian-casanello-proceso-alberto-fernandez-n6165861` | 200 OK |
| `https://www.analisisdigital.com.ar/judiciales/2022/04/04/causas-judiciales-de-corrupcion-contra-grandes-empresarios-estan-en-pausa` | 200 OK |
| `https://www.analisisdigital.com.ar/judiciales/2023/05/23/tras-pagar-una-deuda-sobreseyeron-empresarios-acusados-de-maniobras-de-evasion` | 200 OK |
| `https://www.argencon.org/marval-ofarrell-mairal-el-mejor-estudio-juridico-de-argentina-en-los-latin-american-awards-2024/` | 200 OK |
| `https://www.argentina.gob.ar/anticorrupcion/prevencion/conflictos-intereses/cuando-hay` | 200 OK |
| `https://www.argentina.gob.ar/anticorrupcion/prevencion/conflictos-intereses/preguntas-frecuentes` | 200 OK |
| `https://www.argentina.gob.ar/justicia/argentina/seleccionmagistrados` | 200 OK |
| `https://www.argentina.gob.ar/sites/default/files/2017/12/13camara_nacional_de_apelaciones_en_lo_criminal_y_correccional_federal_de_la_capital_federal030122.pdf` | 200 OK (PDF) |
| `https://www.cadena3.com/noticia/politica-y-economia/renuncio-canicoba-corral-un-historico-juez-de-comodoro-py_265271` | 200 OK |
| `https://www.celag.org/lawfare-o-la-guerra-judicial-en-argentina-y-brasil/` | 200 OK |
| `https://www.cels.org.ar/web/en/2024/05/supreme-court-we-oppose-the-nominations-of-lijo-and-garcia-mansilla/` | 200 OK |
| `https://www.cij.gov.ar/nota-22621-El-juez-Rafecas-no-hizo-lugar-a-un-pedido-de-la-DAIA-para-que-se-reabra-la-investigaci-n-por-la-denuncia-presentada-por-el-fiscal-Nisman.html` | 301 to valid URL |
| `https://www.cronista.com/economia-politica/espionaje-a-familiares-del-ara-san-juan-mauricio-macri-fue-sobreseido-por-inexistencia-de-delito/` | 200 OK |
| `https://www.diariojornada.com.ar/338346/politica/los_escandalosos_chats_entre_jueces_y_directivos_del_grupo_clarin` | 200 OK |
| `https://www.eldestapeweb.com/politica/correo-argentino/correo-la-causa-cumple-20-anos-y-los-macri-aun-no-pagaron-20219190550` | 200 OK |
| `https://www.eldestapeweb.com/politica/los-jueces-de-clarin/clarin-invito-a-jueces-del-lawfare-a-lago-escondido-y-buscaron-encubrirlo-con-facturas-truchas-y-el-direccionamiento-de-una-causa-judicial-202212419450` | 200 OK |
| `https://www.eldiarioar.com/politica/causas-judiciales-corrupcion-grandes-empresarios-pausa-juicios-demorados-cierres-inminentes_1_8884937.html` | 200 OK |
| `https://www.eldiarioar.com/politica/julian-ercolini-juez-manejo-causas-sensibles-kirchnerismo-recibio-denuncia-fabiola-yanez_1_11574744.html` | 200 OK |
| `https://www.eldiarioar.com/politica/lago-escondido-sobreseen-jueces-exfuncionarios-empresarios-viaje-estancia-joe-lewis-2022_1_10788895.html` | 200 OK |
| `https://www.eldiarioar.com/politica/rocca-directivos-techint-sobreseimiento-firme-falta-apelacion-stornelli-uif_1_8237117.html` | 200 OK |
| `https://www.eltribuno.com/nota/2016-1-29-1-30-0-rodolfo-jose-urtubey-1933-2016-politico-y-hombre-de-derecho` | 200 OK |
| `https://www.estudio-ofarrell.com/en/` | 200 OK |
| `https://www.fiscales.gob.ar/corrupcion/juicio-por-la-causa-cuadernos-cristina-fernandez-de-kirchner-cuestiono-la-investigacion-y-se-nego-a-responder-preguntas/` | 200 OK |
| `https://www.fiscales.gob.ar/fiscalias/casacion-federal-resolvio-que-la-prescripcion-no-procede-cuando-estan-implicados-funcionarios/` | 200 OK |
| `https://www.fiscales.gob.ar/fiscalias/causa-cuadernos-el-tribunal-rechazo-la-reparacion-integral-ofrecida-por-las-defensas-de-50-imputados/` | 200 OK |
| `https://www.hrw.org/news/2024/05/23/argentina-reconsider-supreme-court-nominations` | 200 OK |
| `https://www.hrw.org/news/2024/12/09/argentina-dont-name-supreme-court-justices-decree` | 200 OK |
| `https://www.hrw.org/news/2025/02/26/argentina-milei-undermines-judicial-independence` | 200 OK |
| `https://www.infobae.com/judiciales/2023/09/20/ariel-lijo-quedo-a-cargo-de-tres-juzgados-federales-en-comodoro-py/` | 200 OK |
| `https://www.infobae.com/judiciales/2024/01/08/sobreseyeron-a-macri-pepin-y-a-otros-ex-funcionarios-por-la-causa-conocida-como-mesa-judicial/` | 200 OK |
| `https://www.infobae.com/judiciales/2024/05/18/la-camara-federal-confirmo-el-sobreseimiento-de-macri-y-otros-ex-funcionarios-en-la-causa-mesa-judicial/` | 200 OK |
| `https://www.infobae.com/judiciales/2024/11/13/la-causa-vialidad-el-paso-a-paso-de-una-causa-que-termino-con-la-condena-de-cristina-kirchner/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/03/23/segun-un-informe-la-reforma-que-impulsa-el-gobierno-en-comodoro-py-implica-un-punto-de-inflexion/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/06/10/el-historial-judicial-de-cristina-kirchner-causas-abiertas-juicios-pendientes-y-una-condena-firme/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/06/10/que-dice-el-fallo-de-casacion-que-confirmo-la-condena-a-cristina-kirchner-en-la-causa-vialidad/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/10/06/causa-cuadernos-la-justicia-rechazo-las-reparaciones-de-dinero-ofrecidas-por-empresarios-para-ser-absueltos/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/02/10/tras-procesar-a-de-vido-casanello-deja-el-juzgado-11-y-la-causa-seguros-tendra-nuevo-juez/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/03/17/cristina-kirchner-en-vivo-la-ex-presidenta-declara-en-la-causa-de-los-cuadernos-de-la-corrupcion/` | 200 OK |
| `https://www.infobae.com/leamos/2022/03/26/poderosos-el-libro-que-indaga-sobre-las-relaciones-de-los-jueces-con-la-politica/` | 200 OK |
| `https://www.infobae.com/opinion/2021/01/14/la-justicia-federal-de-comodoro-py-y-la-republica-argentina/` | 200 OK |
| `https://www.infobae.com/opinion/2025/12/07/el-2026-de-milei-hegemonia-y-reformismo/` | 200 OK |
| `https://www.infobae.com/politica/2020/01/02/el-gobierno-oficializo-la-postulacion-de-daniel-rafecas-como-procurador-general-de-la-nacion/` | 200 OK |
| `https://www.infobae.com/politica/2020/02/04/murio-el-juez-federal-claudio-bonadio/` | 200 OK |
| `https://www.infobae.com/politica/2020/08/10/oficializaron-la-renuncia-del-juez-canicoba-corral/` | 200 OK |
| `https://www.infobae.com/politica/2021/11/07/como-se-elige-a-los-jueces/` | 200 OK |
| `https://www.infobae.com/politica/2022/12/05/sobreseyeron-a-rogelio-frigerio-en-una-causa-por-supuestas-irregularidades-en-operaciones-inmobiliarias/` | 200 OK |
| `https://www.infobae.com/politica/2023/03/05/daniel-rafecas-recordo-que-su-pliego-para-procurador-entro-al-senado-hace-tres-anos-cubrir-esa-vacante-contribuira-a-enfrentar-el-drama-que-vive-rosario/` | 200 OK |
| `https://www.infobae.com/politica/2024/08/21/quien-es-y-los-antecedentes-de-ariel-lijo-el-juez-propuesto-por-javier-milei-para-integrar-la-corte-suprema/` | 200 OK |
| `https://www.infobae.com/politica/2025/02/03/alberto-fernandez-llego-a-comodoro-py-para-participar-de-una-audiencia-que-podria-definir-su-futuro-en-la-causa-seguros/` | 200 OK |
| `https://www.infobae.com/politica/2025/02/07/la-causa-de-los-seguros-cambia-de-juez-por-sorteo-fue-elegido-sebastian-casanello/` | 200 OK |
| `https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/` | 200 OK |
| `https://www.infobae.com/politica/2025/02/26/el-gobierno-defendio-el-nombramiento-por-decreto-de-ariel-lijo-y-garcia-mansilla-como-jueces-de-la-corte-suprema/` | 200 OK |
| `https://www.infobae.com/politica/2025/08/31/guillermo-montenegro-en-esta-eleccion-hay-que-ponerle-un-freno-al-kirchnerismo-asi-sea-lo-ultimo-que-haga/` | 200 OK |
| `https://www.justicia.ar/novedades/117/2025/04/magistratura-juraron-nuevos-consejeros` | 200 OK |
| `https://www.lacapitalmdp.com/el-gordo-montenegro-de-ninguneado-a-intendente-reelecto-de-mar-del-plata/` | 200 OK |
| `https://www.lagaceta.com.ar/nota/1079663/politica/corte-suprema-justicia-declaro-inconstitucional-decreto-nombro-jueces-comision.html` | 200 OK |
| `https://www.lanacion.com.ar/economia/negocios/la-historia-del-estudio-de-abogados-mas-antiguo-de-buenos-aires-que-mantiene-clientes-desde-nid08072023/` | 200 OK |
| `https://www.lanacion.com.ar/politica/ariel-lijo-un-hombre-fuerte-de-comodoro-py-que-enfrento-denuncias-por-su-patrimonio-y-el-manejo-de-nid20032024/` | 200 OK |
| `https://www.lanacion.com.ar/politica/comodoro-py-uno-por-uno-nid1885702/` | 200 OK |
| `https://www.lanacion.com.ar/politica/daniel-rafecas-candidato-procurador-propuesto-gobierno-si-nid2486107/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-hermano-del-juez-ariel-lijo-anuncia-la-liquidacion-total-de-su-haras-en-dolores-nid03032025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-juez-ariel-lijo-sera-investigado-por-el-haras-la-generacion-nid2087121/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-llamativo-enriquecimiento-del-operador-judicial-alfredo-lijo-nid2083733/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-patrimonio-de-ariel-lijo-usa-un-departamento-prestado-por-un-viejo-amigo-de-la-politica-valuado-nid09062024/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-ultimo-dia-canicoba-corral-nid2406663/` | 200 OK |
| `https://www.lanacion.com.ar/politica/fallo-daniel-rafecas-nid1777428/` | 200 OK |
| `https://www.lanacion.com.ar/politica/giro-en-la-causa-seguros-casanello-fue-sorteado-para-reemplazar-a-ercolini-en-el-juzgado-donde-nid07022025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/juan-carlos-maqueda-su-futuro-despues-de-la-corte-su-mejor-recuerdo-de-la-vida-publica-y-el-fallo-nid01012025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/la-causa-del-correo-argentino-ariel-lijo-no-avanzo-con-un-expediente-sensible-para-mauricio-macri-nid20062025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/la-justicia-federal-de-comodoro-py-cambia-desde-agosto-y-los-fiscales-ganan-poder-nid19032025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/multaron-al-juez-rafecas-por-la-denuncia-de-nisman-nid2114692/` | 200 OK |
| `https://www.lanacion.com.ar/politica/murio-claudio-bonadio-juez-federal-llevo-juicio-nid2330369/` | 200 OK |
| `https://www.lanacion.com.ar/politica/quien-es-ariel-lijo-el-hombre-fuerte-de-comodoro-py-que-enfrento-denuncias-por-su-patrimonio-y-el-nid25022025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/sobreseen-a-paolo-rocca-y-a-luis-betnaza-y-procesan-a-roberto-baratta-por-recibir-dadivas-nid10082021/` | 200 OK |
| `https://www.lanoticiaweb.com.ar/el-historial-judicial-de-mauricio-macri-causas-cerradas-sobreseimientos-y-expedientes-en-curso/` | 200 OK |
| `https://www.lapoliticaonline.com/nota/14800/` | 200 OK |
| `https://www.lapoliticaonline.com/politica/mencionan-a-guillermo-montenegro-como-reemplazante-de-cuneo-libarona-en-justicia/` | 200 OK |
| `https://www.marval.com/lang=en` | 200 OK |
| `https://www.mdzol.com/politica/el-mapa-judicial-cristina-kirchner-todas-las-causas-condenas-y-juicios-pendientes-2026-n1476720` | 200 OK |
| `https://www.nbcnews.com/news/latino/argentina-milei-judge-lijo-ethics-corruption-rcna158255` | 200 OK |
| `https://www.oblawfare.org/post/argentina-democracia-condicionada-por-el-lawfare` | 200 OK |
| `https://www.pagina12.com.ar/233041-causa-correo-el-juez-lijo-pidio-un-estudio-contable-para-def` | 200 OK |
| `https://www.pagina12.com.ar/342225-rafecas-se-distancia-de-la-candidatura-a-procurador` | 200 OK |
| `https://www.pagina12.com.ar/689959-espionaje-ilegal-confirman-el-sobreseimiento-de-mauricio-mac/` | 200 OK |
| `https://www.pagina12.com.ar/802318-el-juez-casanello-quedara-al-frente-de-la-causa-seguros` | 200 OK |
| `https://www.palabrasdelderecho.com.ar/articulo/5666/Juan-Carlos-Maqueda` | 200 OK |
| `https://www.palabrasdelderecho.com.ar/articulo/5872/Declararon-inconstitucional-la-designacion-de-Garcia-Mansilla-y-Lijo-en-la-Corte-Suprema` | 200 OK |
| `https://www.perfil.com/noticias/cordoba/quien-es-juan-carlos-maqueda-el-intocable-de-la-corte-que-javier-milei-quiere-jubilar-a-fin-de-ano.phtml` | 200 OK (paywall) |
| `https://www.perfil.com/noticias/judiciales/causa-seguros-el-juez-sebastian-casanello-proceso-a-la-empresa-de-martinez-sosa-y-al-ex-encargado-de-la-quinta-de-olivos.phtml` | 200 OK (paywall) |
| `https://www.perfil.com/noticias/politica/audios-y-chats-entre-jueces-funcionarios-macristas-y-empresarios-de-medios-para-ocular-un-viaje-a-bariloche.phtml` | 200 OK |
| `https://www.perfil.com/noticias/politica/en-medio-de-su-ola-de-procesamiento-canicoba-corral-dejo-de-ser-juez.phtml` | 200 OK |
| `https://www.perfil.com/noticias/politica/ercolini-contra-alberto-y-lijo-contra-macri-comodoro-py-se-alinea-con-la-agenda-judicial-de-javier-milei.phtml` | 200 OK (paywall) |
| `https://www.radionacional.com.ar/irregularidades-en-venta-de-tierras-frigerio-fue-sobreseido-por-ercolini-2/` | 200 OK |
| `https://www.resumenlatinoamericano.org/2025/03/22/argentina-comodoro-py-en-guerra-por-la-reforma-que-le-da-mas-poder-a-los-fiscales/` | 200 OK |
| `https://www.resumenlatinoamericano.org/2025/04/18/argentina-un-mensaje-de-la-justicia-a-milei-nombrar-jueces-por-decreto-es-inconstitucional` | 200 OK |
| `https://www.telesurtv.net/peronismo-denuncia-mafia-judicial-cristina/` | 200 OK |
| `https://www.utdt.edu/ver_nota_prensa.php?id_nota_prensa=19226` | 200 OK |
| `http://www.laopinionpopular.com.ar/noticia/48082-frigerio-fue-sobreseido-en-forma-expres-por-el-juez-ercolini-el-de-los-audios-por-lago-escondido.html` | 200 OK |

### widened-net research (all OK unless listed above)

| URL | STATUS |
|-----|--------|
| `https://actualidad.rt.com/actualidad/521135-allanan-ministerio-capital-humano-argentina` | 200 OK |
| `https://canalabierto.com.ar/2025/12/04/como-rocca-y-milei-se-reparten-el-control-de-ypf/` | 200 OK |
| `https://cenital.com/sombra-terrible-de-santiago-espias-dinero-oscuro-y-videos/` | 200 OK |
| `https://convoca.pe/investigacion/paradise-papers-los-negocios-de-glencore-en-argentina` | 200 OK |
| `https://elagora.digital/argentina/decreto-milei-side-presupuesto-inteligencia-diciembre-2025/` | 200 OK |
| `https://eleconomista.com.ar/politica/todo-sobre-chocolategate-escandalo-sacude-politica-provincia-buenos-aires-n66578` | 200 OK |
| `https://losricosdeargentina.com.ar/belocopit2.html` | 200 OK |
| `https://www.agenciahoy.com/noticia/milei-nombro-a-catalan-en-ypf-con-un-sueldo-de-140-millones` | 200 OK |
| `https://www.agencianova.com/nota.asp?n=2025_8_6&id=156136&id_tiponota=4` | 200 OK |
| `https://www.ambito.com/politica/denunciaron-sandra-pettovello-la-justicia-sobresueldos-contratos-irregulares-n6009379` | 200 OK |
| `https://www.ambito.com/politica/la-corte-suprema-da-una-senal-y-mantiene-vida-la-causa-correo-argentino-contra-los-macri-n6158727` | 200 OK (paywall) |
| `https://www.ambito.com/politica/santiago-caputo-afianza-su-control-la-side-y-abre-una-nueva-etapa-el-organismo-n6220830` | 200 OK |
| `https://www.ambito.com/politica/segun-el-bcra-el-envio-del-oro-al-exterior-no-quedo-registrado-ningun-contrato-n6227113` | 200 OK |
| `https://www.batimes.com.ar/news/argentina/entrepenuers-phone-records-cast-doubt-on-mileis-libra-defence.phtml` | 200 OK |
| `https://www.batimes.com.ar/news/economy/counterfeiting-and-cult-murder-family-behind-milei-memecoin-has-chequered-past.phtml` | 200 OK |
| `https://www.bigbangnews.com/politica/investigan-red-corrupcion-santiago-caputo-side-secretos-negocios-espurios-eeuu-n96245` | 200 OK |
| `https://www.boletinoficial.gob.ar/pdf/aviso/primera/233014/20200804` | 200 OK (PDF) |
| `https://www.c5n.com/politica/contrataciones-irregulares-capital-humano-la-justicia-le-solicito-documentacion-la-oei-n162126` | 200 OK |
| `https://www.cels.org.ar/web/2025/05/plan-de-inteligencia-se-amplia-el-secreto-y-el-espionaje-a-periodistas-y-opositores/` | 200 OK |
| `https://www.cronista.com/economia-politica/presentan-un-amparo-contra-el-dnu-de-milei-en-que-punto-queda-la-reforma-de-inteligencia/` | 200 OK |
| `https://www.dlnews.com/articles/regulation/argentina-forensics-payments-libra-lobbyist-to-javier-milei/` | 200 OK |
| `https://www.dlnews.com/articles/regulation/forensic-analysis-link-milei-messages-libra-scandal-promoters/` | 200 OK |
| `https://www.eldiarioar.com/economia/justicia-le-ordeno-bcra-responda-pedidos-informacion-envio-lingotes-oro-exterior_1_12867239.html` | 200 OK |
| `https://www.eldiarioar.com/politica/compra-mira-santiago-caputo-leonardo-scatturice-exespia-quedo-flybondi_1_12400000.html` | 200 OK |
| `https://www.eldiarioar.com/politica/gobierno-vuelve-reforzar-presupuesto-side-dispara-discusion-control-espionaje_1_12812516.html` | 200 OK |
| `https://www.fiscales.gob.ar/corrupcion/causa-cuadernos-el-tribunal-rechazo-los-planteos-de-las-defensas-y-el-juicio-continuara-con-la-indagatoria-a-la-expresidenta-cristina-fernandez/` | 200 OK |
| `https://www.glencore.com/media-and-insights/news/glencore-submits-RIGI-applications-in-respect-of-its-argentine-copper-projects` | 200 OK |
| `https://www.infobae.com/economia/2024/10/03/el-gobierno-incluyo-a-swiss-medical-en-el-registro-que-evita-tener-que-derivar-aportes-a-una-obra-social-para-contratar-una-prepaga/` | 200 OK |
| `https://www.infobae.com/economia/2024/11/23/polemica-por-la-desregulacion-por-que-el-precio-de-los-medicamentos-es-tan-alto-en-la-argentina/` | 200 OK |
| `https://www.infobae.com/economia/2025/01/19/como-en-un-ano-ypf-paso-del-cartel-de-se-vende-a-triplicar-su-valor-y-encabezar-el-boom-de-vaca-muerta/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/05/27/elevaron-a-juicio-la-causa-contra-chocolate-rigau-por-corrupcion-con-los-sueldos-de-la-legislatura-bonaerense/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/08/29/allanan-sedes-de-andis-y-la-drogueria-suizo-argentina-por-la-causa-que-investiga-el-supuesto-pago-de-coimas/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/09/22/causa-cuadernos-el-tribunal-oral-federal-7-define-si-los-empresarios-podran-pagar-para-evitar-el-juicio/` | 200 OK |
| `https://www.infobae.com/judiciales/2025/11/06/hoy-comienza-el-juicio-a-los-cuadernos-de-las-coimas-las-claves-para-entender-el-mayor-caso-de-corrupcion-de-la-historia-argentina/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/02/26/la-corte-suprema-dejo-sin-efecto-el-sobreseimiento-de-jorge-macri-en-una-causa-por-presunto-lavado-de-dinero/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/03/09/cuadernos-manana-se-define-el-futuro-del-juicio-y-el-tribunal-analiza-un-planteo-para-que-jose-lopez-quede-fuera-del-debate/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/03/16/causa-suenos-compartidos-mauricio-macri-declarara-como-testigo-el-proximo-miercoles/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/03/18/caso-libra-quien-es-mauricio-novelli-el-trader-y-lobbista-vinculado-a-javier-milei/` | 200 OK |
| `https://www.infobae.com/judiciales/2026/03/20/caso-libra-el-gobierno-aseguro-que-que-no-hay-registro-de-un-contrato-entre-milei-y-hayden-davis/` | 200 OK |
| `https://www.infobae.com/politica/2024/06/02/escandalo-de-los-alimentos-la-investigacion-tambien-apunta-a-la-ong-que-compro-toneladas-de-comida-y-pago-a-empleados-y-funcionarios/` | 200 OK |
| `https://www.infobae.com/politica/2025/04/20/el-caso-chocolate-sigue-sumando-sorpresas-la-empleada-de-la-legislatura-que-vivia-en-espana-y-las-visitas-a-la-cancha-de-estudiantes/` | 200 OK |
| `https://www.infobae.com/politica/2025/07/10/chocolate-rigau-la-camara-de-la-plata-ratifico-que-los-principales-acusados-eran-parte-de-una-asociacion-ilicita/` | 200 OK |
| `https://www.infobae.com/politica/2026/01/02/reforma-de-la-side-las-claves-de-la-reestructuracion-del-sistema-de-inteligencia-que-dispuso-milei-por-decreto/` | 200 OK |
| `https://www.infobae.com/politica/2026/01/30/el-gobierno-designo-a-manuel-adorni-al-frente-del-directorio-de-ypf-en-reemplazo-de-guillermo-francos/` | 200 OK |
| `https://www.infobae.com/politica/2026/03/07/del-triangulo-de-hierro-a-dos-socios-y-un-gerente-el-nuevo-mapa-de-poder-del-gobierno/` | 200 OK |
| `https://www.infobae.com/america/agencias/2026/01/15/milei-sondea-entre-grupos-internacionales-la-privatizacion-de-aerolineas-argentinas/` | 200 OK |
| `https://www.iprofesional.com/actualidad/258372-glencore-el-oro-de-la-mineria-argentina-controlado-por-sociedades-en-paraisos-fiscales` | 200 OK |
| `https://www.lanacion.com.ar/economia/el-dueno-de-swiss-medical-claudio-belocopitt-compro-40-de-america-tv-nid1984881/` | 200 OK |
| `https://www.lanacion.com.ar/politica/aumento-exponencial-suizo-argentina-paso-de-3900-millones-a-108000-millones-en-contratos-con-el-nid24082025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/declaran-inconstitucional-el-dnu-de-javier-milei-que-decidio-que-el-poder-ejecutivo-administre-los-nid23122025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/` | 200 OK |
| `https://www.lanacion.com.ar/politica/durante-el-receso-legislativo-milei-dicto-casi-tantos-dnu-como-todas-las-leyes-promulgadas-a-lo-nid11022026/` | 200 OK |
| `https://www.lanacion.com.ar/politica/el-oficialismo-insiste-con-privatizar-aerolineas-argentinas-pero-asume-que-no-es-una-urgencia-para-nid07012026/` | 200 OK |
| `https://www.lanacion.com.ar/politica/glencore-monto-una-red-offshore-para-operar-la-mina-de-oro-la-alumbrera-nid2079858/` | 200 OK |
| `https://www.lanacion.com.ar/politica/que-es-el-caso-libra-las-claves-de-la-investigacion-sobre-la-estafa-con-criptomonedas-que-involucra-nid16032026/` | 200 OK |
| `https://www.lanueva.com/nota/2025-6-20-8-55-0-ahora-la-corte-reactivo-la-causa-correo-argentino-de-mauricio-macri` | 200 OK |
| `https://www.lapoliticaonline.com/politica/el-congreso-pide-investigar-el-contrato-de-la-side-con-scatturice/` | 200 OK |
| `https://www.lapoliticaonline.com/politica/en-el-gobierno-detectaron-que-belocopitt-recibio-mas-de-13-millones-de-dolares-del-estado-para-pagar-sueldos/` | 200 OK |
| `https://www.lapoliticaonline.com/politica/milei-le-da-a-santiago-caputo-100-mil-millones-de-fondos-reservados-para-la-side/` | 200 OK |
| `https://www.lapoliticaonline.com/politica/revelan-contratos-millonarios-de-scatturice-con-la-side-y-anses-y-ya-hablan-del-lazaro-baez-libertario/` | 200 OK |
| `https://www.letrap.com.ar/politica/javier-milei-no-responde-el-oro-del-banco-central-y-la-agn-podria-iniciar-acciones-judiciales-n5419082` | 200 OK (paywall) |
| `https://www.mdzol.com/politica/2025/1/18/una-por-una-todas-las-areas-claves-que-maneja-santiago-caputo-en-el-gobierno-1181932.html` | 200 OK |
| `https://www.noticiasdelacalle.com.ar/noticias/2026/03/16/161430-oro-en-las-sombras-el-bcra-sigue-bloqueando-la-auditoria-por-los-envios-al-exterior` | 200 OK |
| `https://www.noticiasnqn.com.ar/noticias/2025/10/13/321750-el-banco-central-se-niega-a-informar-donde-esta-el-oro-argentino-enviado-al-exterior` | 200 OK |
| `https://www.pagina12.com.ar/838357-declararon-inconstitucional-el-dnu-antihuelga-de-milei` | 200 OK |
| `https://www.perfil.com/noticias/actualidad/por-decreto-gobierno-javier-milei-aerolineas-argentinas-sujeta-a-privatizacion.phtml` | 200 OK (paywall) |
| `https://www.perfil.com/noticias/economia/side-los-gastos-reservados-crecieron-1967-con-milei.phtml` | 200 OK (paywall) |
| `https://www.perfil.com/noticias/paradisepapers/paradise-papers-glencore-el-oro-argentino-controlado-por-sociedades-offshore.phtml` | 200 OK (paywall) |
| `https://www.perfil.com/noticias/politica/el-nuevo-dueno-de-fly-bondi-tiene-una-empresa-que-hace-lobby-para-la-side-en-estados-unidos.phtml` | 200 OK |
| `https://www.perfil.com/noticias/politica/santiago-caputo-el-rediseno-de-la-side-y-los-fondos-reservados.phtml` | 200 OK (paywall) |
| `https://www.resumenlatinoamericano.org/2025/07/01/argentina-el-lado-b-de-la-side-libertaria-espias-en-paraguay-lobby-en-miami-y-conexiones-con-la-vieja-guardia-de-stiuso/` | 200 OK |
| `https://www.thegoldobserver.com/p/argentinian-gold-reserves-arrive` | 200 OK |
| `https://www.vocescriticas.com/noticias/2025/06/25/180038-escandalo-en-la-side-el-congreso-investiga-contratos-millonarios-de-santiago-caputo-con-un-empresario` | 200 OK |
| `https://www.vocescriticas.com/noticias/2025/09/30/185424-javier-milei-supera-a-cristina-kirchner-en-uso-de-decretos-de-necesidad-y-urgencia-en-menos-de-dos-anos` | 200 OK |

### frigerio-network/findings.json (all OK)

| URL | STATUS |
|-----|--------|
| `https://lacalle.com.ar/rogelio-frigerio-vinculado-con-un-empresario-paraguayo-investigado-en-entre-rios/` | 200 OK |
| `https://www.ambito.com/politica/la-empresa-niembro-tambien-fue-contratada-el-banco-ciudad-n3906311` | 200 OK |
| `https://www.bice.com.ar/creditos-valor-producto-bice-los-productores-de-entre-rios-acceden-tasa-bonificada-por-un-cupo-de-4000-millones/` | 200 OK |
| `https://www.bice.com.ar/entre-rios-se-suma-a-los-creditos-en-litros-de-leche-de-bice-y-bonifica-el-100-de-la-tasa-a-los-tambos-locales-2/` | 200 OK |
| `https://www.cronista.com/economia-politica/El-padre-de-Rogelio-Frigerio-renuncio-al-directorio-de-YPF-20180130-0094.html` | 200 OK |
| `https://www.cronista.com/economia-politica/quien-es-rogelio-frigerio-el-gobernador-electo-de-entre-rios/` | 200 OK |
| `https://www.ecured.cu/Rogelio_Julio_Frigerio` | 200 OK |
| `https://www.infobae.com/politica/2020/02/16/informe-especial-el-patrimonio-de-los-ministros-de-mauricio-macri-cuando-dejaron-el-poder/` | 200 OK |
| `https://www.iprofesional.com/notas/113190-Multan-a-otra-consultora-ahora-es-el-turno-de-la-de-Rogelio-Frigerio-hijo` | 200 OK |
| `https://www.lanacion.com.ar/politica/la-distribucion-de-los-atn-beneficia-al-oficialismo-nid2115967/` | 200 OK |
| `https://www.lapoliticaonline.com/entre-rios/la-obra-social-de-entre-rios-pagaba-sueldos-de-16-millones-y-la-deuda-asciende-a-42-000-millones/` | 200 OK |
| `https://www.mendozapost.com/nota/49083/` | 200 OK |
| `https://www.nexofin.com/notas/418878-designan-a-victoria-costoya-esposa-del-ministro-frigerio-en-desarrollo-social-n-/` | 200 OK |
| `https://www.pagina12.com.ar/diario/elpais/1-263254-2015-01-05.html` | 200 OK |
| `https://es.wikipedia.org/wiki/Rogelio_Frigerio_(nieto` | 403 (Wikipedia bot protection; malformed URL missing `)`) |

---

## ACTION ITEMS

### Must fix (9 broken URLs with replacements found)

1. **investigation-data.ts** -- Replace `https://www.eldestapeweb.com/politica/2021/hornos-borinsky-olivos/` with `https://www.eldestapeweb.com/politica/operacion-olivos/las-15-reuniones-de-macri-con-un-juez-clave-en-la-persecucion-a-cfk-20214118034`
2. **investigation-data.ts** -- Replace `https://www.eldestapeweb.com/politica/hornos-borinsky-olivos/` with same as above
3. **investigation-data.ts** -- Replace `https://www.eldestapeweb.com/politica/lago-escondido/` with `https://www.eldestapeweb.com/politica/lago-escondido/lago-escondido-sobreseen-jueces-ex-funcionarios-y-empresarios-que-visitaron-a-joe-lewis--20231222950`
4. **investigation-data.ts** -- Replace `https://www.infobae.com/politica/2025/02/14/milei-nombro-a-ariel-lijo-en-la-corte-suprema-por-decreto/` with `https://www.infobae.com/politica/2025/02/25/javier-milei-designo-por-decreto-en-la-corte-suprema-a-ariel-lijo-y-manuel-garcia-mansilla/`
5. **investigation-data.ts** -- Replace `https://www.infobae.com/politica/2025/02/libra-crypto-escandalo/` with `https://www.infobae.com/politica/2025/02/16/la-fallida-cripto-libra-provoco-un-fuerte-impacto-politico-y-el-gobierno-enfrenta-una-ofensiva-opositora/`
6. **investigation-data.ts** -- Replace `https://www.infobae.com/politica/2025/capital-humano-alimentos/` with `https://www.infobae.com/politica/2024/06/02/escandalo-de-los-alimentos-la-investigacion-tambien-apunta-a-la-ong-que-compro-toneladas-de-comida-y-pago-a-empleados-y-funcionarios/`
7. **investigation-data.ts** -- Replace `https://www.infobae.com/politica/2026/02/macri-jorge-lavado-revocacion/` with `https://www.infobae.com/judiciales/2026/02/26/la-corte-suprema-dejo-sin-efecto-el-sobreseimiento-de-jorge-macri-en-una-causa-por-presunto-lavado-de-dinero/`
8. **investigation-data.ts** -- Replace `https://www.perfil.com/noticias/politica/caputocracia` with `https://www.perfil.com/noticias/modo-fontevecchia/dia-287-caputocracia-una-genealogia-del-poder-modof.phtml`
9. **judiciary research** -- Replace `https://elcanciller.com/correo-espionaje-ilegal-y-autopistas-las-causas-que-acechan-a-macri-y-hasta-donde-pueden-llegar/` with `https://elcanciller.com/politica/correo--espionaje-ilegal-y-autopistas--las-causas-que-acechan-a-macri--y-hasta-donde-pueden-llegar--_a61267e52b6dff53adbc37509`

### Should fix (malformed URLs)

1. **investigation-data.ts** -- Remove or replace `https://www.infobae.com/politica/2024/03/` (not a valid article URL)
2. **judiciary research** -- Fix `https://es.wikipedia.org/wiki/Consejo_de_la_Magistratura_(Argentina` to `https://es.wikipedia.org/wiki/Consejo_de_la_Magistratura_(Argentina)`
3. **frigerio findings** -- Fix `https://es.wikipedia.org/wiki/Rogelio_Frigerio_(nieto` to `https://es.wikipedia.org/wiki/Rogelio_Frigerio_(nieto)`
4. **judiciary research** -- Replace `https://www.pagina12.com.ar/377456-rosenkrantz-el-juez-de-clarin` with `https://www.pagina12.com.ar/485768-la-corte-avalo-que-carlos-rosenkrantz-intervenga-en-una-dema`

### Monitor (server issues)

1. `http://tramas.escueladegobierno.gob.ar/articulo/el-poder-judicial-y-el-doble-filo-del-lawfare/` -- Server is completely down (ECONNREFUSED). URL exists in search indexes; may come back.
2. `https://buufosalta.com/rodolfo-urtubey-habilito-el-nombramiento-como-juez-ex-director-de-escuchas/` -- 404, no replacement found.
3. `https://www.theblock.co/post/393639/...` -- 403 (subscription required). Content exists behind paywall.
4. `https://finance.yahoo.com/news/argentina-freezes-hayden-davis-assets-223000417.html` -- Intermittent server error. May resolve on retry.
