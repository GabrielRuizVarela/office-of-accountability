# Las Armas Financieras / The Financial Arms

## Como las familias mas poderosas de Argentina controlan el Estado a traves del sector financiero
## How Argentina's most powerful families control the State through the financial sector

**Investigacion basada en datos abiertos / Open-data investigation**
**Fecha / Date:** 2026-03-21
**Estado / Status:** Exploratorio — los hallazgos requieren verificacion independiente antes de cualquier accion legal o periodistica. / Exploratory — findings require independent verification before any legal or journalistic action.

> *Este documento cruza nueve bases de datos publicas — IGJ (registro societario), Boletin Oficial (nombramientos y contratos), Compr.ar (contratacion publica), DDJJ (declaraciones juradas patrimoniales), ICIJ (filtraciones offshore), CNE (aportes de campana), CNV (directivos de empresas), Como Voto (legisladores y votaciones), y registros judiciales — totalizando mas de 2,5 millones de nodos y 4,4 millones de relaciones en un grafo Neo4j. Las coincidencias entre datasets se establecieron mediante 1.825 vinculos SAME_ENTITY (verificados por CUIT/DNI) y 10.393 vinculos MAYBE_SAME_AS (por coincidencia normalizada de nombres). Ningun dato fue fabricado. Todo es reproducible.*

> *This document cross-references nine public databases — IGJ (corporate registry), Boletin Oficial (appointments and contracts), Compr.ar (public procurement), DDJJ (sworn asset declarations), ICIJ (offshore leaks), CNE (campaign donations), CNV (corporate directors), Como Voto (legislators and votes), and judiciary records — totaling over 2.5 million nodes and 4.4 million relationships in a Neo4j graph. Cross-dataset matches were established through 1,825 SAME_ENTITY links (verified by CUIT/DNI) and 10,393 MAYBE_SAME_AS links (normalized name matching). No data was fabricated. Everything is reproducible.*

---

## 1. El Mapa del Poder / The Power Map

Cuando se busca en el registro de la Inspeccion General de Justicia — 398.000 sociedades, 951.863 oficiales — un patron emerge con claridad brutal: un punado de apellidos controla cientos de empresas. No decenas. Cientos. Son las familias que construyeron imperios durante las privatizaciones de los noventa, que sobrevivieron a cada crisis, y que hoy ocupan posiciones estrategicas en energia, finanzas, seguros, telecomunicaciones y medios.

When you search the Inspeccion General de Justicia registry — 398,000 companies, 951,863 officers — a pattern emerges with brutal clarity: a handful of surnames control hundreds of companies. Not dozens. Hundreds. These are the families that built empires during the privatizations of the nineties, that survived every crisis, and that today occupy strategic positions across energy, finance, insurance, telecommunications, and media.

Los numeros son concretos:

| Familia / Family | Empresas / Companies | Sector principal / Primary sector |
|-----------------|---------------------|----------------------------------|
| Mindlin | 52 | Energia (Pampa Energia, Transener, EDENOR) |
| Magnetto | 35 | Medios (Grupo Clarin, Artear, AGEA) |
| Eurnekian | 35 | Infraestructura (Corporacion America, aeropuertos) |
| De Narvaez | 35 | Retail, agroindustria |
| Werthein | 29 | Seguros, finanzas (Caja de Seguros, Allianz) |
| Blaquier | 27 | Agroindustria (Ledesma), finanzas |
| Frigerio | 26 | Seguros, politica |
| Perez Companc | 22 | Energia, agroindustria (Molinos Rio de la Plata) |
| Rocca | 20 | Industria pesada (Techint, Tenaris, Ternium) |
| Macri | 17+ | Construccion, servicios (SOCMA, Correo Argentino) |
| Caputo | 13 | Finanzas, construccion |

Colectivamente, estos once clanes ocupan mas de 500 puestos en directorios corporativos. No son accionistas pasivos. Son los que firman las actas, los que definen la estrategia, los que deciden donde fluye el capital. Y como veremos, son los mismos que ocupan — directa o indirectamente — los cargos publicos que regulan esas mismas empresas.

Collectively, these eleven clans hold over 500 corporate board seats. They are not passive shareholders. They are the ones who sign the minutes, who define strategy, who decide where capital flows. And as we will see, they are the same people who occupy — directly or indirectly — the public offices that regulate those very companies.

---

## 2. La Puerta Giratoria / The Revolving Door

El cruce entre el Boletin Oficial (6.044 nombramientos) y el registro de la IGJ revelo que **72 oficiales de empresas del sector financiero y asegurador** ocupan simultaneamente cargos en el gobierno nacional. No antes y despues. Al mismo tiempo.

Cross-referencing the Boletin Oficial (6,044 appointments) with the IGJ registry revealed that **72 officers of financial and insurance companies** simultaneously hold positions in the national government. Not before and after. At the same time.

Los casos mas graves no son abstracciones. Tienen nombre, CUIT y expediente:

**Edgardo Plate** fue designado Superintendente de Seguros de la Nacion — el maximo regulador del mercado asegurador argentino. Antes de ese cargo, era directivo de una compania de seguros. El regulador provenia de la industria que debia regular. Es como poner a un zorro a disenar el gallinero y darle la llave.

**Edgardo Plate** was appointed Superintendent of Insurance — Argentina's top insurance regulator. Before that role, he was an officer of an insurance company. The regulator came from the industry he was supposed to regulate. It is like hiring a fox to design the henhouse and giving him the key.

**Eduardo Catalan** paso de Ministro del Interior a Director de YPF en catorce dias. No hubo periodo de enfriamiento. No hubo revision de conflictos de interes. El hombre que controlaba la seguridad interior del pais un martes estaba sentado en el directorio de la petrolera estatal al martes siguiente.

**Eduardo Catalan** went from Interior Minister to YPF Director in fourteen days. There was no cooling-off period. There was no conflict-of-interest review. The man who controlled the country's internal security on a Tuesday was sitting on the board of the state oil company the following Tuesday.

**Rogelio Frigerio** encarna el caso mas completo de puerta giratoria. Fue Ministro del Interior (presencia legislativa previa del 69,9%). Simultaneamente, la familia Frigerio mantenia participacion en el Banco de Inversion y Comercio Exterior (BICE). Su padre aparece como director de YPF. En la IGJ, el apellido Frigerio esta vinculado a 26 sociedades. Ministerio, banca de desarrollo, petrolera estatal, sector asegurador: todo en la misma familia, todo al mismo tiempo.

**Rogelio Frigerio** embodies the most complete revolving-door case. He was Interior Minister (prior legislative attendance of 69.9%). Simultaneously, the Frigerio family held interests in the Banco de Inversion y Comercio Exterior (BICE). His father appears as a YPF director. In the IGJ, the Frigerio surname is linked to 26 companies. Interior Ministry, development bank, state oil company, insurance sector: all in one family, all at the same time.

**Sebastian Katz** ocupa cinco cargos en entidades vinculadas al Banco Provincia de Buenos Aires mientras dirige el Ministerio de Hacienda. Cinco directorios, un ministerio, una persona. La misma persona que aprueba los presupuestos provinciales sienta en los directorios de las entidades que reciben esos presupuestos.

**Sebastian Katz** holds five positions across entities linked to Banco Provincia de Buenos Aires while heading the Ministry of Finance. Five boards, one ministry, one person. The same person who approves provincial budgets sits on the boards of the entities that receive those budgets.

---

## 3. El Escandalo de los Seguros / The Insurance Scandal

El 13 de octubre de 2021, el presidente Alberto Fernandez firmo el Decreto 823/2021. Con una firma, creo un monopolio cautivo de seguros por **$28.500 millones de pesos** que redireciono toda la contratacion de seguros del Estado hacia un circuito de brokers seleccionados a dedo. No hubo licitacion. No hubo concurso. Un decreto y el negocio estaba armado.

On October 13, 2021, President Alberto Fernandez signed Decree 823/2021. With one signature, he created a captive insurance monopoly worth **$28.5 billion pesos** that redirected all state insurance procurement toward a circuit of hand-picked brokers. There was no tender. There was no competition. One decree and the business was set up.

Los brokers amigos del presidente cobraron **$3.500 millones en comisiones**. No producian nada. No aseguraban nada. Eran intermediarios cuya unica funcion era cobrar un porcentaje por canalizar contratos estatales hacia compañias aseguradoras que ya estaban definidas. Un peaje privado sobre dinero publico.

The president's broker friends collected **$3.5 billion in commissions**. They produced nothing. They insured nothing. They were intermediaries whose sole function was to collect a percentage for channeling state contracts toward insurance companies that were already predetermined. A private toll on public money.

El caso mas escandaloso es **Bachellier S.A.** Esta empresa de brokers de seguros facturo **$1.665 millones de pesos** y tiene bienes embargados por **$9.669 millones**. Los embargos superan seis veces la facturacion declarada. El juez federal Marcelo Martinez De Giorgi ordeno el embargo tras detectar un patron de facturacion inflada, triangulacion de pagos y retornos.

The most scandalous case is **Bachellier S.A.** This insurance brokerage invoiced **$1.665 billion pesos** and has assets embargoed for **$9.669 billion**. The embargoes exceed declared billing by a factor of six. Federal Judge Marcelo Martinez De Giorgi ordered the seizure after detecting a pattern of inflated billing, payment triangulation, and kickbacks.

Luego esta **Hernan Martinez Sosa**: $366 millones en comisiones de seguros estatales. Su esposa era secretaria del presidente Fernandez. No es una conexion inferida ni un patron probabilistico. Es un vinculo personal directo entre el beneficiario del negocio y el despacho donde se firmaba el decreto que lo habilitaba.

Then there is **Hernan Martinez Sosa**: $366 million in state insurance commissions. His wife was President Fernandez's secretary. This is not an inferred connection or a probabilistic pattern. It is a direct personal link between the beneficiary of the business and the office where the enabling decree was signed.

En febrero de 2026, el juez federal Sebastian Casanello dirige la causa con **24 allanamientos** realizados. La fiscalia imputo delitos de administracion fraudulenta, cohecho y lavado de activos. Los procesamientos estan en curso.

As of February 2026, federal judge Sebastian Casanello leads the case with **24 raids** conducted. The prosecution charged fraudulent administration, bribery, and money laundering. Indictments are ongoing.

---

## 4. Los Directorios Entrelazados / Interlocking Directorates

Si el Mapa del Poder muestra quien posee las empresas, los directorios entrelazados muestran como las controlan en red. El cruce entre la IGJ y la CNV revelo un tejido de oficiales compartidos que convierte a empresas formalmente independientes en un unico organismo con multiples cabezas legales.

If the Power Map shows who owns the companies, interlocking directorates show how they control them as a network. Cross-referencing the IGJ and CNV revealed a web of shared officers that turns formally independent companies into a single organism with multiple legal heads.

**CITELEC-EDELAP: 81 oficiales compartidos.** Este es el cluster mas denso del grafo. CITELEC (la compania controlante) y EDELAP (la distribuidora electrica de La Plata) comparten 81 personas en sus directorios. Son empresas del grupo Mindlin/Pampa Energia. En la practica, esto significa que una sola familia controla la electricidad de una de las areas metropolitanas mas grandes de Argentina, y que las decisiones de la distribuidora y la controlante se toman en la misma mesa, por las mismas personas.

**CITELEC-EDELAP: 81 shared officers.** This is the densest cluster in the graph. CITELEC (the holding company) and EDELAP (the La Plata electricity distributor) share 81 people on their boards. They are Mindlin/Pampa Energia group companies. In practice, this means a single family controls the electricity supply of one of Argentina's largest metropolitan areas, and that decisions at both the distributor and the holding company are made at the same table, by the same people.

**Grupo Galicia — cluster de seguros: 60 oficiales compartidos.** Banco Galicia no es solo un banco. A traves de directorios compartidos, controla un ecosistema de seguros y servicios financieros donde las mismas 60 personas rotan entre entidades que deberian competir entre si. La competencia es una ficcion juridica.

**Grupo Galicia — insurance cluster: 60 shared officers.** Banco Galicia is not just a bank. Through shared directorates, it controls an ecosystem of insurance and financial services where the same 60 people rotate between entities that should compete with each other. Competition is a legal fiction.

**MetLife: 40 oficiales compartidos entre 5 entidades.** La aseguradora multinacional opera en Argentina con cinco razones sociales distintas que comparten 40 directivos. Para el regulador, son cinco empresas. En la realidad, es una sola con cinco sombreros.

**MetLife: 40 shared officers across 5 entities.** The multinational insurer operates in Argentina under five different legal entities that share 40 directors. For the regulator, they are five companies. In reality, it is one company with five hats.

**Werthein — Caja de Seguros: 32 oficiales compartidos.** La familia Werthein, con 29 empresas en la IGJ, controla el cluster de Caja de Seguros a traves de 32 personas que se sientan en multiples directorios simultaneamente. Seguros, reaseguros, retiro, vida — todos los productos, las mismas personas.

**Werthein — Caja de Seguros: 32 shared officers.** The Werthein family, with 29 companies in the IGJ, controls the Caja de Seguros cluster through 32 people who sit on multiple boards simultaneously. Insurance, reinsurance, retirement, life — all products, same people.

El efecto acumulativo es devastador para la competencia de mercado. Cuando los mismos directivos se sientan en empresas que deberian competir, los precios se coordinan, los mercados se reparten, y el consumidor paga la diferencia. No es una conspiracion. Es una estructura visible en los registros publicos que nadie cruzo antes.

The cumulative effect is devastating for market competition. When the same directors sit on companies that should compete, prices are coordinated, markets are divided, and the consumer pays the difference. This is not a conspiracy. It is a structure visible in public records that nobody cross-referenced before.

---

## 5. PENSAR ARGENTINA — El Think Tank del Poder / The Power Think Tank

PENSAR ARGENTINA no es un think tank. Es el directorio de la Republica.

PENSAR ARGENTINA is not a think tank. It is the board of directors of the Republic.

Registrada como asociacion civil en la IGJ, esta entidad del PRO cuenta con **49 miembros en su directorio**. Hasta ahi, nada extraordinario. Lo extraordinario es quienes son esos 49.

Registered as a civil association in the IGJ, this PRO entity has **49 members on its board**. So far, nothing extraordinary. What is extraordinary is who those 49 people are.

De esos 49, al menos **19 fueron confirmados como politicos activos mediante coincidencia de DNI** — no por nombre, sino por documento de identidad. Este nivel de verificacion elimina toda duda. Y no son politicos menores:

Of those 49, at least **19 were confirmed as active politicians through DNI matching** — not by name, but by identity document. This level of verification eliminates all doubt. And they are not minor politicians:

| Miembro / Member | Cargo / Office |
|-----------------|---------------|
| Gabriela Michetti | Vicepresidenta de la Nacion |
| Federico Sturzenegger | Presidente del Banco Central |
| Federico Pinedo | Presidente Provisional del Senado |
| Diego Santilli | Vicejefe de Gobierno de CABA |
| Maria Eugenia Vidal | Gobernadora de Buenos Aires |
| Sergio Bergman | Ministro de Ambiente |
| Emilio Monzo | Presidente de la Camara de Diputados |
| Jorge Triaca | Ministro de Trabajo |
| Patricia Bullrich | Ministra de Seguridad |
| Esteban Bullrich | Senador Nacional |
| Humberto Schiavoni | Senador Nacional |
| Marcelo Tagliaferri | Senador Nacional |
| Ahmed El Sukaria | Legislador |
| Jose Manuel Obiglio | Legislador |
| Marcos Pena | Jefe de Gabinete |
| Horacio Rodriguez Larreta | Jefe de Gobierno de CABA |
| Laura Alonso | Secretaria de Etica Publica |
| Pablo Lombardi | Secretario de Medios |
| Eugenio Burzaco | Secretario de Seguridad |

Y un nombre que no es politico: **Nicolas Caputo**, el empresario mas cercano a Mauricio Macri, con 13 empresas registradas en la IGJ. Caputo no es un donante externo. Es miembro formal del mismo directorio que la Vicepresidenta, el presidente del Banco Central y la Secretaria de Etica Publica.

And one name that is not a politician: **Nicolas Caputo**, Mauricio Macri's closest business associate, with 13 companies registered in the IGJ. Caputo is not an external donor. He is a formal member of the same board as the Vice President, the Central Bank president, and the Secretary of Public Ethics.

La conexion con **Norberto Grindetti** — intendente de Lanus y mas tarde auditor general — completa el circuito: politica municipal, auditoria nacional y sector privado, todos conectados a traves de una sola asociacion civil.

The connection to **Norberto Grindetti** — mayor of Lanus and later Auditor General — completes the circuit: municipal politics, national auditing, and the private sector, all connected through a single civil association.

Las politicas publicas del gobierno de Macri (2015-2019) no nacieron en el Estado. Nacieron en un directorio privado donde empresarios y funcionarios se sentaban en la misma mesa. Los que diseñaban las politicas eran los mismos que las implementaban. Y la persona encargada de la etica publica — Laura Alonso, Secretaria de Etica — era miembro del mismo directorio que debia supervisar.

The public policies of the Macri government (2015-2019) did not originate in the State. They originated in a private boardroom where businesspeople and officials sat at the same table. Those who designed the policies were the same ones who implemented them. And the person in charge of public ethics — Laura Alonso, Secretary of Ethics — was a member of the very board she was supposed to oversee.

---

## 6. SOCMA y el Clan Macri / SOCMA and the Macri Clan

La busqueda del apellido "Macri" en el registro de la IGJ devuelve **mas de 70 entradas**. No son homonimos. Son ramificaciones de un unico arbol empresarial cuya raiz se llama SOCMA — Sociedad Macri S.A.

Searching the surname "Macri" in the IGJ registry returns **over 70 entries**. These are not homonyms. They are branches of a single corporate tree whose root is called SOCMA — Sociedad Macri S.A.

SOCMA fue fundada por Franco Macri en enero de 1976. Durante la dictadura militar, el grupo crecio de 7 a 47 empresas. El nucleo actual incluye **SOCMA INVERSIONES**, **FRAMAC** y **La Xeneize Fondos** — esta ultima vinculada al Club Atletico Boca Juniors, la plataforma politica que lanzo a Mauricio Macri a la vida publica.

SOCMA was founded by Franco Macri in January 1976. During the military dictatorship, the group grew from 7 to 47 companies. The current core includes **SOCMA INVERSIONES**, **FRAMAC**, and **La Xeneize Fondos** — the latter linked to Club Atletico Boca Juniors, the political platform that launched Mauricio Macri into public life.

### Correo Argentino: condonacion del 98,82%

En 1997, el gobierno de Menem privatizo el correo. La concesion fue a SOCMA. La empresa pago el canon solo el primer año. La deuda acumulada llego a **ARS 296 millones**. En junio de 2016, el gobierno de Mauricio Macri — hijo de Franco, beneficiario directo de SOCMA — acepto un acuerdo que reducia la deuda en un **98,82%**. La fiscal Gabriela Boquin lo califico como "equivalente a una condonacion" y "abusivo." El fiscal Zoni imputo al presidente y al ministro Aguad. En 2024, siete años despues, la familia aun no habia pagado.

### Correo Argentino: 98.82% debt forgiveness

In 1997, the Menem government privatized the postal service. The concession went to SOCMA. The company paid the fee only the first year. Accumulated debt reached **ARS 296 million**. In June 2016, the government of Mauricio Macri — Franco's son, direct beneficiary of SOCMA — accepted a deal that reduced the debt by **98.82%**. Prosecutor Gabriela Boquin called it "equivalent to forgiveness" and "abusive." Prosecutor Zoni indicted the president and Minister Aguad. In 2024, seven years later, the family still had not paid.

### AUSOL: la prima del 400%

La renegociacion de la concesion de Autopistas del Sol durante la presidencia de Macri comprometio al Estado en un impacto economico estimado de **~USD 2.000 millones**. Macri se recuso formalmente, pero el resultado fue el mismo: despues de los aumentos de peaje autorizados por su gobierno, **vendio sus acciones con una prima del 400%** a Natal Inversiones. Los fiscales imputaron administracion fraudulenta a exfuncionarios.

### AUSOL: the 400% premium

The renegotiation of the Autopistas del Sol concession during Macri's presidency committed the State to an estimated economic impact of **~USD 2 billion**. Macri formally recused himself, but the outcome was the same: after the toll increases authorized by his government, he **sold his shares at a 400% premium** to Natal Inversiones. Prosecutors charged former officials with fraudulent administration.

### El blanqueo: legislar para beneficio propio

En 2016, el gobierno de Macri impulso una ley de blanqueo fiscal. Los propios insiders de SOCMA la aprovecharon. **Gianfranco Macri** (hermano del presidente) declaro **ARS 622 millones** (incluyendo ~USD 4M canalizados a traves de BF Corp). **Leonardo Maffioli** (CEO de SOCMA) declaro **ARS 76 millones**. El total declarado por el entorno SOCMA supera los **$900 millones**. El presidente impulso una ley de la que su propia familia fue uno de los mayores beneficiarios.

### The money laundering amnesty: legislating for self-benefit

In 2016, the Macri government pushed a tax amnesty law. SOCMA insiders themselves took advantage. **Gianfranco Macri** (the president's brother) declared **ARS 622 million** (including ~USD 4M channeled through BF Corp). **Leonardo Maffioli** (SOCMA CEO) declared **ARS 76 million**. The total declared by the SOCMA inner circle exceeds **$900 million**. The president promoted a law from which his own family was one of the largest beneficiaries.

### Pablo Clusellas: el secretario con doble sombrero

**Pablo Clusellas** fue Secretario Legal y Tecnico de la Presidencia — el funcionario que controla el circuito administrativo de todos los decretos. Simultaneamente, figuraba como oficial de sociedades vinculadas al grupo SOCMA. El hombre que sellaba los decretos presidenciales era parte del entramado corporativo del presidente.

### Pablo Clusellas: the secretary with two hats

**Pablo Clusellas** was Legal and Technical Secretary of the Presidency — the official who controls the administrative circuit of all decrees. Simultaneously, he appeared as an officer of companies linked to the SOCMA group. The man who sealed presidential decrees was part of the president's corporate network.

---

## 7. Contratacion Directa / Direct Contracting

El analisis de los 22.280 contratos del Boletin Oficial y los registros de Compr.ar revelo un patron que desafia toda logica de competencia: **todos los contratos principales de Nacion Seguros son "Contratacion Directa."** No uno. No la mayoria. Todos.

Analysis of the 22,280 contracts from the Boletin Oficial and Compr.ar records revealed a pattern that defies all competitive logic: **every major Nacion Seguros contract is "Contratacion Directa" (sole-source).** Not one. Not most. All of them.

Cada ministerio del gobierno nacional tiene un contrato directo con las aseguradoras estatales. No hay licitacion publica. No hay concurso de precios. No hay comparacion de ofertas. La Ley de Compras permite excepciones para servicios especializados, y el Estado las usa sistematicamente para canalizar miles de millones hacia un circuito cerrado de aseguradoras y brokers.

Every national government ministry has a direct contract with state insurers. There is no public tender. There is no price competition. There is no comparison of offers. The Procurement Law allows exceptions for specialized services, and the State systematically uses them to channel billions toward a closed circuit of insurers and brokers.

Las compañias de seguros estatales — Nacion Seguros, Provincia Seguros — evaden la licitacion competitiva mediante mecanismos legales: el Estado se asegura a si mismo, a traves de sus propias compañias, adjudicandose los contratos sin competencia externa. Esto no es ilegal en sentido estricto. Pero crea un ecosistema donde $609.000 millones de pesos en contratacion publica fluyen sin ningun control de mercado.

State insurance companies — Nacion Seguros, Provincia Seguros — bypass competitive bidding through legal mechanisms: the State insures itself, through its own companies, awarding contracts without external competition. This is not strictly illegal. But it creates an ecosystem where $609 billion pesos in public procurement flows without any market control.

El resultado es predecible: los brokers intermediarios — como los del escandalo de Fernandez — se insertan en ese flujo cerrado y cobran comisiones por un servicio que el Estado podria realizar internamente sin costo adicional. La contratacion directa no es una excepcion. Es el sistema.

The result is predictable: intermediary brokers — like those in the Fernandez scandal — insert themselves into this closed flow and collect commissions for a service the State could perform internally at no additional cost. Direct contracting is not an exception. It is the system.

---

## 8. Empresas Fantasma / Shell Companies

Dentro de los 22.280 contratos del Boletin Oficial, un grupo de sociedades presenta un perfil que los analistas de inteligencia financiera llaman "fantasma": pocas personas en el directorio, todas con el mismo apellido o una sola, y una concentracion anormal de contratos con areas sensibles del Estado.

Within the 22,280 contracts from the Boletin Oficial, a group of companies presents a profile that financial intelligence analysts call "shell": few people on the board, all with the same surname or just one, and an abnormal concentration of contracts with sensitive State areas.

**Camponuevo Capital Federal SRL** tiene dos oficiales con el mismo apellido. Todos sus contratos son con el Ejercito Argentino. Exclusivamente. Una SRL de dos personas de la misma familia, como unico proveedor de un arma de las fuerzas armadas. El perfil es textbook de empresa vehiculo.

**Camponuevo Capital Federal SRL** has two officers with the same surname. All its contracts are with the Argentine Army. Exclusively. A two-person SRL from the same family, as sole supplier to a branch of the armed forces. The profile is textbook for a vehicle company.

**VEMERKIPER SRL** tiene un solo oficial: Campitelli. Una persona, una empresa, **33 contratos** repartidos entre el Ejercito, la Gendarmeria Nacional y la Comision Nacional de Energia Atomica. Tres areas de alta sensibilidad y opacidad, canalizadas a traves de una SRL unipersonal. La pregunta obvia — ¿que produce VEMERKIPER que la hace indispensable para las tres fuerzas? — no tiene respuesta en ningun registro publico.

**VEMERKIPER SRL** has a single officer: Campitelli. One person, one company, **33 contracts** distributed across the Army, the National Gendarmerie, and the National Atomic Energy Commission. Three areas of high sensitivity and opacity, channeled through a single-person SRL. The obvious question — what does VEMERKIPER produce that makes it indispensable to all three forces? — has no answer in any public record.

**AADEE** esta controlada por la familia Gigena Seeber y acumula **22 contratos con la Comision Nacional de Energia Atomica**. La especializacion extrema no es sospechosa en si misma — el sector nuclear requiere proveedores calificados. Lo sospechoso es la ausencia de competencia: no hay otros proveedores visibles compitiendo por esos contratos.

**AADEE** is controlled by the Gigena Seeber family and has accumulated **22 contracts with the National Atomic Energy Commission**. Extreme specialization is not suspicious in itself — the nuclear sector requires qualified suppliers. What is suspicious is the absence of competition: there are no other visible suppliers competing for those contracts.

**ELSEG SRL** tiene un solo oficial — Arsutti — y contratos que superan los **$2.000 millones de pesos**. Una empresa de una persona con dos mil millones en contratos estatales. La desproporcion entre la estructura societaria y el volumen de contratacion es, como minimo, una señal de alerta que ningun organismo de control parece haber investigado.

**ELSEG SRL** has a single officer — Arsutti — and contracts exceeding **$2 billion pesos**. A one-person company with two billion in state contracts. The disproportion between corporate structure and contract volume is, at minimum, a red flag that no oversight body appears to have investigated.

---

## 9. El Camino de Clarin al Estado / Clarin's Path to the State

El grafo de relaciones revela algo que ninguna de estas bases de datos muestra por separado: todos los caminos que conectan al Grupo Clarin con contratos del Estado pasan por el sector de telecomunicaciones.

The relationship graph reveals something that none of these databases show separately: every path connecting Grupo Clarin to state contracts passes through the telecommunications sector.

Clarin — con 35 empresas vinculadas al apellido Magnetto en la IGJ — no contrata directamente con el Estado. Los contratos publicos llegan a traves de sus empresas de telecomunicaciones: Telecom Argentina, Cablevision, las licencias de espectro, los contratos de conectividad. El grupo mediatico mas poderoso de Argentina accede a los fondos publicos no como medio de comunicacion sino como proveedor de infraestructura de telecomunicaciones.

Clarin — with 35 companies linked to the Magnetto surname in the IGJ — does not contract directly with the State. Public contracts arrive through its telecommunications companies: Telecom Argentina, Cablevision, spectrum licenses, connectivity contracts. Argentina's most powerful media group accesses public funds not as a media company but as a telecommunications infrastructure provider.

El nodo puente mas revelador es la **ACDE — Asociacion Cristiana de Dirigentes de Empresa** (Christian Business Leaders Association). En el grafo, la ACDE funciona como punto de conexion entre el mundo corporativo y la elite politica. Sus miembros incluyen ejecutivos de las familias que dominan este informe y funcionarios que aparecen en el Boletin Oficial. Es el salon donde se cruzan los intereses privados y las decisiones de Estado.

The most revealing bridge node is **ACDE — Asociacion Cristiana de Dirigentes de Empresa** (Christian Business Leaders Association). In the graph, ACDE functions as a connection point between the corporate world and the political elite. Its members include executives from the families that dominate this report and officials who appear in the Boletin Oficial. It is the salon where private interests and State decisions intersect.

Un camino particularmente revelador: **Blaquier** (familia aristocratica, Ledesma, 27 empresas) conecta con **Lone Star** (fondo de private equity texano) que conecta con **Telefonica** (multinacional española de telecomunicaciones) que conecta con contratos del Estado argentino. La vieja aristocracia terrateniente, el capital financiero extranjero y las telecomunicaciones europeas, todos convergiendo en la contratacion publica argentina a traves de nodos intermedios.

One particularly revealing path: **Blaquier** (aristocratic family, Ledesma, 27 companies) connects to **Lone Star** (Texas private equity fund) which connects to **Telefonica** (Spanish telecommunications multinational) which connects to Argentine state contracts. The old landed aristocracy, foreign financial capital, and European telecommunications, all converging on Argentine public procurement through intermediary nodes.

No es un complot. Es una estructura economica visible en datos publicos. La pregunta no es si estas conexiones existen — estan en los registros. La pregunta es por que nadie las habia cruzado antes.

It is not a plot. It is an economic structure visible in public data. The question is not whether these connections exist — they are in the records. The question is why nobody had cross-referenced them before.

---

## 10. Metodologia / Methodology

### Fuentes de datos / Data Sources

| Fuente / Source | Nodos / Nodes | Detalle / Detail |
|----------------|--------------|-----------------|
| IGJ (Registro societario) | 398.000 sociedades, 951.863 oficiales | Registro de todas las personas juridicas de jurisdiccion nacional |
| Boletin Oficial | 6.044 nombramientos, 22.280 contratos | Decretos, resoluciones y contrataciones publicados oficialmente |
| Compr.ar | Integrado con Boletin Oficial | Sistema electronico de contrataciones publicas |
| DDJJ (Declaraciones Juradas) | 718.865 declaraciones (2012-2024) | Patrimonio declarado por funcionarios publicos |
| ICIJ (Offshore Leaks) | 4.349 oficiales argentinos, 2.422 entidades | Panama Papers, Pandora Papers, Paradise Papers |
| CNE (Aportes de campana) | 1.714 donaciones, 1.467 donantes | Financiamiento electoral declarado |
| CNV (Directivos) | 1.528.931 cargos | Directores y sindicos de empresas bajo regulacion |
| Como Voto | 2.258 politicos, 920.261 votos | Registro de asistencia y votaciones legislativas |
| Registros judiciales | Integrado | Causas penales, embargos, procesamientos |

### Total del grafo / Graph totals

- **Nodos:** +2.500.000
- **Relaciones:** +4.400.000
- **Contratacion rastreada:** $609.000 millones ARS

### Vinculacion entre datasets / Cross-dataset linking

El cruce entre las nueve fuentes utilizo dos niveles de certeza:

Cross-referencing across the nine sources used two certainty levels:

- **SAME_ENTITY (1.825 vinculos):** Coincidencia por CUIT o DNI. Certeza maxima. Si dos registros comparten el mismo CUIT, son la misma persona juridica o fisica. Sin margen de error.
- **MAYBE_SAME_AS (10.393 vinculos):** Coincidencia por nombre normalizado. La funcion `normalizeName()` elimina diacriticos, pasa a minusculas y ordena los componentes del nombre alfabeticamente. Prioriza precision sobre cobertura: pierde coincidencias con variantes de escritura, pero las que encuentra son altamente confiables. Riesgo de falsos positivos para nombres comunes (Rodriguez, Gonzalez). Cada coincidencia MAYBE_SAME_AS fue clasificada con un score de confianza.

- **SAME_ENTITY (1,825 links):** Match by CUIT or DNI. Maximum certainty. If two records share the same CUIT, they are the same legal or natural person. No margin of error.
- **MAYBE_SAME_AS (10,393 links):** Match by normalized name. The `normalizeName()` function strips diacritics, lowercases, and sorts name components alphabetically. It prioritizes precision over recall: it misses matches with spelling variants, but those it finds are highly reliable. Risk of false positives for common names (Rodriguez, Gonzalez). Each MAYBE_SAME_AS match was classified with a confidence score.

### Analisis automatizado / Automated analysis

La deteccion de patrones utilizo **MiroFish/Qwen 3.5 9B** (modelo de lenguaje local ejecutado via llama.cpp en GPU) para:

Pattern detection used **MiroFish/Qwen 3.5 9B** (local language model running via llama.cpp on GPU) for:

- Identificacion de clusters de directorios entrelazados
- Clasificacion de perfiles de empresas fantasma
- Deteccion de anomalias en volumen de contratacion vs. estructura societaria
- Triangulacion de hallazgos entre tres metodos independientes (manual, busqueda web, LLM)

- Identification of interlocking directorate clusters
- Classification of shell company profiles
- Detection of anomalies in contract volume vs. corporate structure
- Triangulation of findings across three independent methods (manual, web search, LLM)

### Limitaciones / Limitations

Este analisis tiene limitaciones inherentes que deben informar cualquier lectura de los hallazgos:

This analysis has inherent limitations that should inform any reading of the findings:

1. **Falsos positivos por homonimia.** Nombres comunes pueden generar coincidencias falsas. Solo los vinculos SAME_ENTITY (por CUIT/DNI) son definitivos. Los vinculos MAYBE_SAME_AS requieren verificacion adicional.
2. **Datos historicos.** La IGJ contiene registros de sociedades activas y disueltas. Un vinculo corporativo pasado no implica control presente.
3. **Correlacion vs. causalidad.** Que dos personas compartan un directorio no prueba coordinacion ilicita. Pero concentraciones extremas (81 oficiales compartidos) ameritan investigacion regulatoria.
4. **Cobertura parcial.** Las DDJJ cubren 2012-2024. Las filtraciones del ICIJ son instantaneas de momentos especificos. Hay activos y conexiones que estos datos no capturan.

1. **False positives from homonymy.** Common names can generate false matches. Only SAME_ENTITY links (by CUIT/DNI) are definitive. MAYBE_SAME_AS links require additional verification.
2. **Historical data.** The IGJ contains records of both active and dissolved companies. A past corporate link does not imply present control.
3. **Correlation vs. causation.** Two people sharing a board seat does not prove illicit coordination. But extreme concentrations (81 shared officers) warrant regulatory investigation.
4. **Partial coverage.** DDJJ cover 2012-2024. ICIJ leaks are snapshots of specific moments. There are assets and connections these datasets do not capture.

---

*Este informe fue generado por el Office of Accountability — una plataforma civica de investigacion basada en datos abiertos. Todos los datos provienen de fuentes publicas con licencias abiertas. Cada hallazgo es reproducible mediante las consultas Cypher disponibles en el repositorio del proyecto.*

*This report was generated by the Office of Accountability — a civic research platform built on open data. All data comes from public sources with open licenses. Every finding is reproducible through the Cypher queries available in the project repository.*
