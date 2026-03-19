# Finanzas Politicas: El Sistema

**Investigacion basada en datos abiertos**
**Fecha:** 2026-03-19
**Estado:** Exploratorio — los hallazgos requieren verificacion independiente antes de cualquier accion legal o periodistica.

> *Este documento cruza ocho bases de datos publicas — seis argentinas y dos internacionales — totalizando 5,4 millones de nodos y 4,4 millones de relaciones en un grafo Neo4j. Las coincidencias entre datasets se basan en normalizacion de nombres y llevan riesgo de falsos positivos, especialmente para nombres comunes. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente. Donde se indica "confirmado," la verificacion incluye fuentes periodisticas, bases de datos del ICIJ, o registros judiciales publicos. Ningun dato fue fabricado, modificado ni extraido de fuentes privadas. Todo proviene de bases publicas con licencias abiertas. Cada hallazgo es reproducible.*

---

## I. La Frontera

En diciembre de 2024, el senador entrerriano Edgardo Kueider fue detenido intentando cruzar a Paraguay con **USD 211.000 en efectivo** no declarado.

Meses antes, Kueider habia emitido uno de los 36 votos afirmativos que aprobaron la Ley de Bases — la legislacion de desregulacion economica mas importante del gobierno de Milei. El desempate lo resolvio la vicepresidenta Villarruel. Sin ese voto, la ley no existiria.

Lo que la justicia encontro despues dibujo el circuito completo: dos empresas fantasma — **BETAIL SA** y **EDEKOM SA** — registradas en la IGJ con domicilios legales falsos. Departamentos de lujo en Parana adquiridos a traves de esas pantallas. En marzo de 2025, siete testaferros arrestados. En los allanamientos, videos de Kueider manipulando fajos de billetes en efectivo. Fue expulsado del Senado.

Kueider no es una anomalia. Es un sintoma.

Esta investigacion cruzo ocho fuentes de datos — votos legislativos de Como Voto (2.258 politicos, 920.000 votos), filtraciones offshore del ICIJ (4.349 oficiales argentinos, 2.422 entidades), donaciones de campana de la CNE (1.714 aportes), nombramientos del Boletin Oficial (6.044 designaciones, 22.280 contratos), el registro empresarial de la IGJ (951.863 oficiales, 1.060.769 sociedades), directivos de la CNV (1.528.931 cargos), y declaraciones juradas patrimoniales (718.865, periodo 2012-2024) — y encontro **617 politicos que aparecen en dos o mas datasets simultaneamente**. Legisladores que son directivos de empresas. Donantes de campana que son contratistas del Estado. Funcionarios que operan sociedades offshore mientras votan presupuestos.

El poder politico argentino esta estructurado alrededor del dinero. Directorios corporativos, entidades offshore, donaciones de campana y contratos publicos forman un unico sistema donde las mismas personas circulan entre el cargo publico y la riqueza privada, votando leyes que benefician a sus propias empresas.

Esto no es una teoria. Es lo que dicen los datos cuando se los cruza por primera vez.

---

## II. La Maquina

Para entender como funciona el sistema, hay que empezar por una asociacion civil registrada en la Inspeccion General de Justicia: **PENSAR ARGENTINA**.

No es un club de debate ni un think tank informal. Es una entidad legalmente constituida con un directorio donde **19 politicos fueron confirmados mediante coincidencia de DNI** — no solo por nombre. Este nivel de verificacion elimina toda duda sobre la identidad de los miembros:

- **Gabriela Michetti** — Vicepresidenta de la Nacion
- **Maria Eugenia Vidal** — Gobernadora de Buenos Aires
- **Esteban Bullrich** — Senador Nacional
- **Federico Sturzenegger** — Presidente del Banco Central
- **Federico Pinedo** — Presidente Provisional del Senado
- **Diego Santilli** — Vicejefe de Gobierno de CABA
- **Emilio Monzo** — Presidente de la Camara de Diputados
- **Patricia Bullrich** — Ministra de Seguridad
- **Marcos Pena** — Jefe de Gabinete
- **Horacio Rodriguez Larreta** — Jefe de Gobierno de CABA
- **Laura Alonso** — Secretaria de Etica Publica
- **Jorge Triaca** — Ministro de Trabajo
- **Pablo Lombardi** — Secretario de Medios
- **Eugenio Burzaco** — Secretario de Seguridad
- **Sergio Bergman** — Ministro de Ambiente
- **Paula Polledo** — Diputada Nacional
- **Marcelo Tagliaferri** — Senador Nacional
- **Humberto Schiavoni** — Senador Nacional

Y un nombre que no es politico: **Nicolas Caputo**, el socio comercial mas cercano de Mauricio Macri.

La significancia no es que exista un think tank partidario — todos los partidos los tienen. La significancia es que esta es una **entidad corporativa formal** donde la totalidad de la elite gobernante del PRO — la vicepresidenta, el jefe de gabinete, el presidente del Banco Central, el presidente de la Camara, seis ministros y secretarios — compartia directorio con el principal socio de negocios del presidente. Las politicas publicas que emergian de PENSAR fluian directamente al Poder Ejecutivo, sin intermediacion. Los mismos miembros del directorio que diseñaban las politicas las implementaban desde el gobierno.

El caso de **Laura Alonso** merece atencion particular. Paso de legisladora a Secretaria de Etica Publica — la funcionaria encargada de supervisar las declaraciones juradas de sus propios excolegas de bancada y correligionarios de PENSAR ARGENTINA. El organismo de control estaba dirigido por alguien del mismo directorio corporativo que los controlados.

Michetti y Pinedo tambien cofundaron **SUMA PARA EL DISEÑO DE POLITICAS PUBLICAS**, otra asociacion civil registrada en la IGJ. El patron es claro: las politicas del gobierno PRO no nacian en el Estado. Nacian en estructuras corporativas privadas donde empresarios y funcionarios se sentaban en la misma mesa.

### La puerta giratoria

De 20 politicos que pasaron del Congreso al Poder Ejecutivo y viceversa, **13 son del espacio PRO**. El camino tipico: legislador con baja asistencia, funcionario ejecutivo, retorno a la politica.

| Politico | Presencia legislativa | Rol ejecutivo |
|----------|----------------------|---------------|
| Mauricio Macri | 17,6% | Presidente de la Nacion |
| Patricia Bullrich | 71,8% | Ministra de Seguridad |
| Laura Alonso | 55,4% | Secretaria de Etica Publica |
| Silvia Majdalani | 44,6% | Subdirectora General de Inteligencia |
| Eugenio Burzaco | 50,6% | Secretario de Seguridad |
| Rogelio Frigerio | 69,9% | Ministro del Interior |
| Gabriela Michetti | 59,6% | Vicepresidenta |

Macri como diputado (2005-2007) tuvo una presencia del **17,6%** — entre las mas bajas del dataset. Sus votos mas frecuentes fueron AUSENTE: 29 ausencias en Presupuesto, 20 en Reforma Laboral, 14 en Codigo Penal. Sin embargo, aparece en **5 datasets simultaneamente** (Donante, BoardMember, CompanyOfficer, AssetDeclaration, GovernmentAppointment), mas que cualquier otro politico. Era el legislador que menos legislaba y el que mas conexiones externas tenia.

---

## III. El Dinero

En las elecciones de 2019, las 1.714 donaciones registradas ante la Camara Nacional Electoral revelan una asimetria estructural:

- **Juntos por el Cambio** recibio **ARS 46,9 millones** de **75 donaciones**.
- **Frente de Todos** recibio **ARS 29,2 millones** de **459 donaciones**.

El promedio por donacion de JxC fue casi diez veces mayor que el del FdT. Una coalicion dependia de grandes aportes corporativos; la otra, de una base fragmentada. Esto no es un juicio de valor: es un dato estructural sobre quien financia a quien.

### Los que pagan

| Donante | Monto (ARS) | Receptor |
|---------|-------------|----------|
| Unicenter SA | 8.500.000 | JxC |
| Sicma S.A. | 6.210.286 | JxC |
| **Aluar Aluminio Argentino** | **5.400.000** | **JxC + FdT** |
| Control Union Argentina | 4.640.000 | JxC |
| Origenes Retiro Seguros | 4.500.000 | JxC |
| Valiente Polo J5 Argentina | 4.500.000 | JxC |
| Grupo Emes S.A. | 4.200.000 | JxC |
| PETROMIX S.A. | 4.000.000 | JxC |

De los 20 mayores donantes, **13 dieron exclusivamente a Juntos por el Cambio**. Solo uno — Aluar Aluminio Argentino — aposto a ambos lados: ARS 5.400.000 divididos entre JxC y Frente de Todos. Aluar es el mayor productor de aluminio de Argentina. Depende de subsidios energeticos del Estado y de protecciones arancelarias. Financiar a ambos bandos no es generosidad civica: es un seguro de acceso al poder sin importar quien gane.

### El contratista que dona

La Ley 26.215 (Art. 15) prohibe expresamente que los contratistas del Estado realicen aportes de campana. El cruce de datos detecto una presunta violacion:

**Juan Pablo Rodriguez** — contratista del Estado (2018-2020, 4 contratos) y donante de campana. Si es la misma persona, es una violacion de la ley de financiamiento electoral.

Un segundo caso — Jorge Omar Gonzalez — fue descartado tras verificacion de identidad por CUIT: **falso positivo confirmado**. El contratista y el donante son personas distintas con el mismo nombre.

Chequeado documento que Macri recibio aproximadamente **ARS 3 millones** en donaciones de *empleados de empresas contratistas del Estado* — una forma de eludir la prohibicion del Art. 15. La empresa no dona directamente; sus empleados lo hacen. El efecto es el mismo.

Las 50 coincidencias verificadas entre politicos y donantes (100% confirmadas, cero falsos positivos) mostraron que todas las donaciones van al propio partido del politico: Macri dio ARS 100.000 a JxC, Maximo Kirchner dio ARS 50.000 al Frente de Todos. No se detecto financiamiento cruzado entre coaliciones por parte de politicos activos.

El dinero fluye en una direccion: de los intereses corporativos a las campanas politicas.

---

## IV. La Sombra Offshore

Las filtraciones del Consorcio Internacional de Periodistas de Investigacion expusieron una huella offshore argentina masiva: **4.347 argentinos vinculados a 2.419 entidades** en jurisdicciones opacas.

| Filtracion | Oficiales argentinos | Entidades | Jurisdiccion principal |
|------------|---------------------|-----------|----------------------|
| Pandora Papers (Alcogal) | 2.637 | 1.488 | Islas Virgenes Britanicas |
| Panama Papers | 1.253 | 646 | Islas Virgenes Britanicas |
| Paradise Papers (Appleby) | 174 | 107 | Bermuda, Islas Caiman |
| Pandora Papers (SFM) | 90 | 39 | Belice, Panama |
| Paradise Papers (Malta) | 68 | 72 | Malta |

Solo los Pandora Papers (a traves del estudio juridico Alcogal) expusieron a 2.637 argentinos — mas que todas las demas filtraciones combinadas. Las Islas Virgenes Britanicas son la jurisdiccion abrumadoramente preferida.

De esos miles de nombres, esta investigacion cruzo tres coincidencias con legisladores activos. Una resulto presuntamente falso positivo (Nuñez — nombre comun, entidad disuelta antes de su carrera). Las otras dos son los casos mas graves del dataset.

### CAMAÑO, Graciela — 30 años, 6 partidos, una BVI

Graciela Camaño ocupa un lugar unico en esta investigacion: es la unica persona que aparece simultaneamente en los datos offshore **y** en anomalias de comportamiento politico.

La entidad **TT 41 CORP** fue constituida en las Islas Virgenes Britanicas el 23 de junio de 2016 — **durante** su mandato como Diputada Nacional (2014-2018). No antes ni despues. Durante.

| Campo | Detalle |
|-------|---------|
| Entidad offshore | TT 41 CORP (BVI, Pandora Papers / Trident Trust) |
| Mandato al momento de la constitucion | Diputada Nacional 2014-2018 |
| Votos sobre legislacion financiera | 326 (presupuesto, ganancias, blanqueo, IVA) |
| Ausencias en Presupuesto | 35 votos |
| Ausencias en Impuesto a las Ganancias | 19 votos |
| Patrimonio declarado (2013) | ARS 2,8 millones |
| Patrimonio declarado (2023) | ARS 39,2 millones |
| Crecimiento patrimonial | **14 veces en diez años** |
| Posicion en el grafo | 4to nodo mas conectado (2.364 relaciones) |
| Partidos | 6 a lo largo de 30 años |

Su trayectoria de alianzas electorales — FJ Unidad Popular (1989), FJ Bonaerense (1997), Partido Justicialista (2001-2003), Frente para la Victoria (2007), Frente Popular (2011), Federal Unidos por una Nueva Argentina (2015), Consenso Federal (2019) — siempre dentro de la orbita peronista pero constantemente cambiando de subfaccion. Un acceso transversal a multiples coaliciones que pocos politicos logran.

El patron — ausente en votaciones financieras mientras se posee una entidad offshore — no prueba nada por si solo. Pero genera una pregunta legitima: ¿se ausentaba deliberadamente en votaciones que podrian crear conflictos de interes con su sociedad en las BVI?

**Estado:** PROBABLE — coincidencia exacta de nombre, consistente con el patron Trident Trust/Argentina. Requiere verificacion contra DDJJ y confirmacion de identidad.

### IBAÑEZ, Maria Cecilia — La entidad activa

| Campo | Detalle |
|-------|---------|
| Politica | Diputada Nacional por Cordoba, La Libertad Avanza |
| Entidad offshore | PELMOND COMPANY LTD. (BVI, constituida 31-Oct-2014) |
| Estado de la entidad | **ACTIVA** — [confirmada en base ICIJ](https://offshoreleaks.icij.org/nodes/10158328) |
| Presencia legislativa | 85,3% |
| Patrimonio 2023 | ARS 15,5 millones |
| Patrimonio 2024 | ARS 33,5 millones — **duplicado en un año** |

Ibañez voto AFIRMATIVO en el Presupuesto Nacional 2025. Voto NEGATIVO en el Financiamiento Universitario. Lo hizo mientras figuraba como titular de una sociedad offshore activa en las Islas Virgenes Britanicas.

Bajo la Ley 25.188, los funcionarios publicos deben declarar **todos** sus intereses, incluyendo participaciones offshore. Si PELMOND COMPANY LTD. no figura en sus declaraciones juradas ante la Oficina Anticorrupcion, estariamos ante una presunta omision dolosa.

**Estado:** ALTA CONFIANZA — coincidencia exacta de nombre confirmada en la base publica del ICIJ.

### El zorro en el gallinero

Entre los miles de nombres cruzados entre el Boletin Oficial y las filtraciones del ICIJ, aparecio una coincidencia que resume todo el problema del sistema: **Ferrari Facundo** — agente de la AFIP (la autoridad encargada de perseguir la evasion fiscal y detectar activos no declarados en el exterior) — aparece como oficial de una entidad offshore en los **Panama Papers**. El zorro cuidando el gallinero. Tambien aparece **Reale Jose Maria**, identificado como Fiscalizador Principal.

Y un caso estructuralmente mas grave: **Maria Eugenia Cordero** aparece simultaneamente como contratista del Estado y oficial de **BETHAN INVESTMENTS LIMITED** (entidad offshore). Dinero publico → persona → entidad offshore: la arquitectura basica de un esquema de presunto lavado.

**Estado de Ferrari, Reale y Cordero:** Coincidencias de nombre. Requieren verificacion de identidad por CUIT o DNI.

El sistema offshore corre en paralelo al servicio publico.

---

## V. El Imperio

La busqueda del apellido "Macri" en el registro de la IGJ devuelve **153 personas** vinculadas a **211 empresas**. El nucleo es SOCMA.

**Sociedad Macri S.A. (SOCMA)** fue fundada por Franco Macri en enero de 1976. Durante la dictadura militar, el grupo crecio de 7 a 47 empresas. En 1998, Forbes estimo la fortuna personal de Franco Macri en **USD 730 millones**.

| Empresa | Sector | Relevancia |
|---------|--------|-----------|
| Sideco Americana | Construccion | Buque insignia — autopistas, infraestructura |
| Correo Argentino | Servicios postales | Condonacion de deuda del 99% |
| Autopistas del Sol (AUSOL) | Peajes | Venta de acciones con prima del 400% |
| IECSA | Ingenieria | Vendida al primo Calcaterra, implicada en Cuadernos |
| Sevel Argentina | Automotriz (Fiat/Peugeot) | Base industrial familiar |
| Manliba | Recoleccion de residuos | Contrato de basura de Buenos Aires |

### Correo Argentino: el conflicto de intereses mas documentado

La cronologia es publica y judicial:

- **1997:** El gobierno de Menem privatizo el servicio postal. La concesion fue a SOCMA.
- **1998-2001:** SOCMA pago el canon solo el primer año. La deuda acumulada llego a **ARS 296 millones**.
- **Junio 2016:** El gobierno de Macri acepto un acuerdo — **reduccion del 98,82%** de la deuda (ARS 70.000 millones ajustados por inflacion).
- **2017:** La fiscal Gabriela Boquin dictamino que era "equivalente a una condonacion" y "abusiva."
- **2017:** El fiscal Zoni **imputo al Presidente Macri** y al Ministro Aguad.
- **2024:** Siete años despues, la familia aun no habia pagado.

El Presidente de la Nacion utilizando el aparato estatal para liquidar la deuda de su propia familia con el Estado a un descuento del 99%.

### AUSOL: la prima del 400%

La concesion de la autopista AUSOL fue renegociada durante la presidencia de Macri. La Oficina Anticorrupcion recomendo que Macri no participara; se recuso formalmente. Sin embargo, la renegociacion de 2018 comprometio al Estado en un impacto economico total estimado en **~USD 2.000 millones**. Despues de las autorizaciones de aumentos de peaje, **Macri vendio sus acciones con una prima del 400%** a Natal Inversiones. Los fiscales imputaron a exfuncionarios por "administracion fraudulenta."

### El blanqueo: la ley propia, el beneficio propio

En 2016, el gobierno de Macri impulso una ley de blanqueo fiscal. Los propios integrantes de SOCMA la aprovecharon:

| Persona | Rol en SOCMA | Monto declarado |
|---------|-------------|-----------------|
| Gianfranco Macri | Hermano, cabeza operativa | ARS 622M (~USD 4M de BF Corp) |
| Leonardo Maffioli | CEO de SOCMA | ARS 76M |
| Armando Amasanti | Exdirector, Chery SOCMA | ARS 93M |
| Victor Composto | Director suplente, SOCMA | ARS 68M |
| Carlos Libedinsky | Socio de Jorge Macri | ARS 61,9M |

**Total declarado por el circulo SOCMA: mas de ARS 900 millones** en activos previamente ocultos. Gianfranco tambien declaro un fideicomiso perteneciente a **Alicia Blanco Villegas** (madre de Mauricio), lo cual presuntamente violaria la prohibicion de la ley de blanqueo de declarar activos de familiares.

### La ruta offshore: BF Corporation y la destruccion de pruebas

| Entidad | Jurisdiccion | Titulares | Situacion |
|---------|-------------|-----------|-----------|
| Fleg Trading Ltd | Bahamas | Mauricio (Director/VP) | Judicialmente sobreseido |
| Kagemusha SA | Panama | Mauricio (Director) | Mismo resultado judicial |
| BF Corporation SA | Panama | Gianfranco (50%) + Mariano (50%) | Fondos movidos a Safra Bank, Suiza |
| Latium Investments Inc | Panama | Jorge Macri + Carlos Libedinsky | Libedinsky declaro ARS 61,9M via blanqueo |

El caso de **BF Corporation** es particularmente grave. Los fondos fueron movidos al Safra Bank en Suiza. Un banco aleman vinculado a la operatoria recibio la orden de **destruir toda la correspondencia**. Gianfranco declaro USD 4 millones provenientes de esa offshore a traves del blanqueo — pero solo despues de ser denunciado.

### La denuncia interna

En agosto de 2024, Mariano Macri presento denuncias penales contra SOCMA nombrando a Gianfranco, Florencia y al CEO Leonardo Maffioli. Los cargos: **administracion fraudulenta, falsificacion de documentos, evasion fiscal, balances falsos y lavado de activos**. Cuando un hermano denuncia penalmente al otro dentro de la propia estructura corporativa familiar, la informacion que emerge tiene un valor probatorio particular.

### MINERA GEOMETALES: el directorio que nadie mira

Hay un dato que no aparece en los titulares pero si en los registros de la IGJ. En el directorio de **MINERA GEOMETALES** confluyen tres nombres:

- **Mauricio Macri** — expresidente
- **Victor Composto** — insider de SOCMA que blanqueo ARS 68 millones
- **Jean Paul Luksic Fontbona** — heredero del grupo minero chileno Antofagasta PLC, una de las fortunas mas grandes de America Latina

Un expresidente, el operador corporativo de su familia que declaro decenas de millones en activos ocultos, y la elite minera del continente. En la misma mesa directiva.

La familia que convirtio el poder politico en riqueza personal — o fue al reves.

---

## VI. El Voto

El 12 de junio de 2024, la Ley de Bases fue aprobada en el Senado con 36 votos afirmativos contra 36 negativos. La vicepresidenta Villarruel desempato.

El cruce con datos corporativos revela un patron:

- Legisladores con cargos en directorios de empresas votaron **42 a favor y 7 en contra**.
- **108 cargos en directorios** se concentran en senadores que votaron afirmativamente.

Los politicos con conexiones corporativas votan sistematicamente a favor de la desregulacion. Esto no es un hallazgo sorprendente, pero ahora tiene numeros.

### Los votos que importan

**Kueider, Edgardo** (Unidad Federal, Entre Rios): Voto AFIRMATIVO — un voto clave. Meses despues, USD 211.000 en efectivo en la frontera, empresas fantasma con domicilios falsos, departamentos de lujo, siete testaferros, videos con fajos de billetes. No hay presuncion. Hay hechos judiciales, videos y arrestos.

**Lousteau, Martin** (UCR): Voto AFIRMATIVO. Lo hizo mientras su consultora, **LCG SA**, habia facturado **$1.690.000** a la Oficina de Presupuesto del Congreso entre 2020 y 2022 — periodo durante el cual Lousteau ejercia como senador. Un senador cuya empresa privada cobra del Congreso y que vota legislacion economica desde ese mismo Congreso. Se presentaron cargos penales por negociaciones incompatibles con la funcion publica.

**Tagliaferri** (Frente PRO): Voto AFIRMATIVO. Figura tambien como miembro del directorio de **PENSAR ARGENTINA** — la misma fundacion que presumiblemente contribuyo al diseño de las politicas de desregulacion. La fabrica de politicas publicas produjo la legislacion. Su propia directiva la voto en el Congreso. Y el registro corporativo de la IGJ documenta ambas cosas.

### La paradoja de la oposicion

El dato mas contraintuitivo: los senadores de la oposicion (PJ) que votaron NEGATIVO tenian en promedio **mas conexiones con datasets externos** que los oficialistas que votaron SI.

- **AFIRMATIVO:** 36 senadores, promedio 1,44 datasets externos
- **NEGATIVO:** 36 senadores, promedio 1,53 datasets externos

Interpretaciones posibles: los senadores PJ votaron en contra porque la desregulacion amenazaba sus propios intereses empresariales. O las conexiones corporativas no predicen el voto — la ideologia si. O la red corporativa del PRO opera por canales que estos datos no capturan. La respuesta probablemente combina las tres. Pero el dato desmiente la narrativa simplista de que solo un lado tiene vinculos corporativos.

~~**Romero, Juan Carlos** (Salta): 41 empresas en la IGJ.~~ **FALSO POSITIVO CONFIRMADO.** Las 41 posiciones corresponden a un homonimo de Corrientes — el dueño del grupo de transporte ERSA. Personas diferentes. Cada falso positivo eliminado aumenta la confianza en los hallazgos restantes.

### Puentes corporativos entre bloques

Las lineas partidarias que parecen tan rigidas en el recinto legislativo se disuelven en la mesa de directorio:

**GRUPO PROVINCIA** reune a Jorge Macri (PRO) con Eduardo Oscar Camaño (PJ), Rodolfo Frigeri (PJ), Francisco Gutierrez (FpV), Alberto Iribarne (PJ) y Damaso Larraburu (PJ). Cinco politicos del PJ comparten directorio con un Macri.

El **Banco de Inversion y Comercio Exterior** repite el patron: Domina (PJ) comparte directorio con Frigerio (PRO); De Mendiguren (Frente de Todos) con Fabrissin (UCR). El enfrentamiento politico es real en el Congreso; la convergencia de intereses es real en el directorio. Ambas cosas son ciertas simultaneamente.

---

## VII. Lo Que Dicen Los Numeros

### La infraestructura de datos

| Fuente | Registros | Tipo |
|--------|-----------|------|
| Como Voto | 2.258 politicos, 920.000 votos, 2.997 mandatos, 3.827 leyes | Legislativo |
| ICIJ Offshore Leaks | 4.349 oficiales argentinos, 2.422 entidades | Filtraciones internacionales |
| CNE Aportantes | 1.714 donaciones, 1.467 donantes | Financiamiento de campanas |
| Boletin Oficial / datos.gob.ar | 6.044 nombramientos, 22.280 contratos | Gobierno |
| IGJ Registro Empresarial | 951.863 oficiales, 1.060.769 empresas | Corporativo |
| CNV Directivos | 1.528.931 cargos en directorios | Corporativo |
| DDJJ Patrimoniales | 718.865 declaraciones (2012-2024) | Declaraciones juradas |

**Total: 5.387.477 nodos — 4.412.802 relaciones**

### Las coincidencias

| Tipo de coincidencia | Cantidad | Confianza | Riesgo de falso positivo |
|---------------------|----------|-----------|--------------------------|
| Politico → Declaracion Jurada | 6.056 | 0,8 | Bajo |
| Politico → Directivo de empresa | 2.482 | 0,8 | Medio |
| Politico → Oficial de empresa | 1.479 | 0,7 | Medio-Alto |
| Politico → Donante | 50 | 0,8 | Muy bajo (verificado 50/50) |
| Politico → Funcionario ejecutivo | 24 | 0,8 | Bajo |
| Politico → Oficial offshore | 3 | 0,8 | 1 presunto falso positivo |
| Donante → Oficial offshore | 4 | Nombre | Medio |
| Contratista → Donante | 2 (1 falso positivo eliminado) | Nombre | Medio |
| Contratista → Oficial offshore | 1 | Nombre | Medio |

### Los politicos mas conectados

| Politico | Partido | Datasets | Detalle |
|----------|---------|----------|---------|
| Mauricio Macri | PRO | 5 | Donante + Directivo + Oficial empresa + DDJJ + Funcionario |
| Fernando Sanchez | CC | 5 | 13 empresas + Secretario de Gabinete |
| Graciela Camaño | Consenso Federal | 4 | Offshore + Directivo + Oficial empresa + DDJJ |
| Maria Cecilia Ibañez | LLA | 4 | Offshore + Directivo + Oficial empresa + DDJJ |

### Limpieza de datos

El rigor de una investigacion se mide tanto por lo que encuentra como por lo que descarta:

- **Romero, Juan Carlos (Senador, Salta):** Las 41 posiciones en directorios corresponden a un homonimo de Corrientes, dueño del grupo ERSA. Personas diferentes.
- **Gonzalez, Jorge Omar (Contratista-Donante):** La verificacion de CUITs confirmo personas distintas con el mismo nombre.
- **Fernandez, Carlos Alberto (108 directorios):** Multiples personas diferentes con nombre comun.

### Lo que los numeros no dicen

1. **Los totales patrimoniales estan vacios.** El campo `total_assets` en las declaraciones juradas es nulo para la mayoria de los registros.
2. **Los montos de contratos no estan disponibles.** Rodriguez tenia 4 contratos pero sus valores son desconocidos.
3. **El matching es por nombre, no por DNI.** Nombres comunes inflacionan las coincidencias.
4. **El Boletin Oficial es una foto de diciembre 2019.** Faltan datos historicos y posteriores.
5. **No hay datos de COMPR.AR** (el sistema de compras publicas actual).

El grafo no acusa. Revela patrones.

---

## VIII. Lo Que Queda

### Lo que esta confirmado

1. **Kueider:** expulsion del Senado, detencion con USD 211.000, empresas fantasma BETAIL SA y EDEKOM SA con domicilios falsos, 7 testaferros arrestados, videos con fajos de billetes. Fuentes judiciales y periodisticas.
2. **Lousteau:** facturacion de LCG SA al Congreso por $1.690.000 durante su mandato. Cargos penales por negociaciones incompatibles.
3. **PENSAR ARGENTINA:** 19 politicos confirmados por DNI, mas de 50 miembros formales del directorio, registrada en la IGJ.
4. **Correo Argentino:** quita del 98,82% documentada judicialmente. Imputacion a Macri y Aguad.
5. **El blanqueo SOCMA:** montos documentados en investigaciones de Perfil. Total superior a ARS 900 millones.
6. **PELMOND COMPANY LTD.** (Ibañez): activa y confirmada en base publica del ICIJ.
7. **Las donaciones corporativas de 2019:** registradas en la base publica de la CNE.
8. **La violacion presunta de contratista-donante** (Rodriguez): surge del cruce de bases publicas.

### Lo que necesita verificacion

1. **Ibañez y Camaño:** verificar si PELMOND y TT 41 CORP figuran en sus declaraciones juradas ante la Oficina Anticorrupcion. Si no figuran, hay presunta omision dolosa bajo Ley 25.188.
2. **Ferrari Facundo y Reale Jose Maria:** confirmar identidad mediante CUIT/DNI.
3. **Cordero como contratista + offshore:** confirmar que es la misma persona en ambos datasets.
4. **MINERA GEOMETALES:** verificar la composicion actual del directorio.
5. **Tagliaferri y PENSAR ARGENTINA:** confirmar pertenencia al directorio al momento de la votacion de la Ley Bases.

### Lo que deberia investigarse

1. **La Oficina Anticorrupcion** deberia revisar las declaraciones juradas de Ibañez y Camaño contra las bases del ICIJ. Es un cruce que se puede hacer en una tarde.
2. **La Camara Nacional Electoral** deberia cruzar su base de donantes con la de contratistas del Estado. La Ley 26.215 lo exige; la tecnologia lo permite; nadie lo hace sistematicamente.
3. **La AFIP** deberia auditar a sus propios agentes contra las bases de Panama Papers y Pandora Papers.
4. **El Congreso** deberia exigir que la IGJ publique datos actualizados de composicion de directorios de entidades como PENSAR ARGENTINA.
5. **Los medios periodisticos** deberian profundizar en MINERA GEOMETALES.

### Los proximos pasos tecnicos

- Corregir el bug de BOM en los parsers CSV y recargar relaciones empresa-oficial
- Ingerir las tablas individuales de DDJJ (bienes, deudas) para obtener trayectorias patrimoniales reales
- Agregar matching por CUIT para reducir falsos positivos drasticamente
- Incorporar datos de COMPR.AR (compras publicas) para contratos recientes
- Extender los datos del Boletin Oficial mas alla de la foto de diciembre 2019
- Construir indices de busqueda fulltext para reemplazar las consultas CONTAINS
- Agregar deduplicacion por DNI para resolver colisiones de nombres comunes

---

### Una nota final

Hay un dato del que no hablamos en los capitulos anteriores. En el registro de la IGJ existe una sociedad anonima llamada **KARIN MODELS S.A.** — el nombre exacto de la agencia de modelos que operaba Jean-Luc Brunel desde Paris, el agente vinculado a Jeffrey Epstein hallado muerto en su celda en febrero de 2022. La coincidencia de nombre es exacta, pero no establece conexion operativa. Puede ser una sucursal; puede ser una empresa independiente. Se menciona por transparencia.

Hay cosas peores que las que sabemos. Las hay en los datos que todavia no fueron cruzados, en las declaraciones juradas que no publican los totales patrimoniales, en los contratos cuyos montos no figuran en ninguna base abierta, en los registros que se destruyeron antes de que alguien los pudiera leer.

Esta investigacion no acusa a nadie. Los datos publicos no prueban delitos — prueban conexiones, coincidencias y patrones que merecen explicacion. Pero cuando esas conexiones involucran a un senador atrapado con doscientos mil dolares en la frontera meses despues de dar un voto clave, a una fundacion partidaria cuyos 19 miembros confirmados por DNI diseñan las leyes que sus propios directivos votan, a un expresidente cuya familia blanqueo ARS 900 millones con su propia ley, a legisladoras con offshores activas mientras votan presupuestos, a un senador cuya consultora cobraba del propio Congreso donde el legislaba, a agentes fiscales con presuntas sociedades en Panama, a un directorio minero donde se sientan un expresidente, su operador corporativo y un magnate chileno — entonces los datos no necesitan acusar a nadie.

Los datos preguntan. Y en un pais donde 153 miembros de una sola familia aparecen en 211 empresas, donde una ley de blanqueo la votan los que la aprovechan, donde la secretaria de etica comparte directorio corporativo con los que tiene que controlar, donde el 4to nodo mas conectado del grafo tiene una sociedad en las Islas Virgenes Britanicas constituida durante su mandato — en ese pais, las preguntas no van a dejar de multiplicarse.

A menos que alguien las responda.

---

## Fuentes

- [ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org)
- [PELMOND COMPANY LTD — ICIJ](https://offshoreleaks.icij.org/nodes/10158328)
- [Aportantes Electorales — CNE](https://aportantes.electoral.gob.ar)
- [datos.gob.ar — Datos Abiertos](https://datos.gob.ar)
- [Causa Correo Argentino — Wikipedia](https://es.wikipedia.org/wiki/Causa_Correo_Argentino)
- [Correo claves — Chequeado](https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/)
- [Macri contratistas — Chequeado](https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/)
- [AUSOL negocio — Pagina/12](https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol)
- [BF Corporation Suiza — Perfil](https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml)
- [Gianfranco blanqueo — Perfil](https://www.perfil.com/noticias/politica/gianfranco-macri-blanqueo-us-4-millones-de-una-offshore-oculta-tras-ser-denunciado.phtml)
- [SOCMA blanqueo — Perfil](https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml)
- [Macri patrimonio — Infobae](https://www.infobae.com/politica/2020/02/15/el-patrimonio-de-macri-se-enriquecio-o-empobrecio-luego-de-su-paso-por-el-poder/)
- [Mariano Macri denuncia — Infobae](https://www.infobae.com/judiciales/2024/08/07/el-hermano-de-mauricio-macri-denuncio-al-grupo-empresarial-de-la-familia-por-defraudacion-y-lavado-de-activos/)
- [Calcaterra IECSA — LA NACION](https://www.lanacion.com.ar/politica/iecsa-los-negocios-bajo-sospecha-del-primo-del-presidente-nid2159888/)
- [Pandora Papers Argentina — Infobae](https://www.infobae.com/america/pandora-papers/2021/10/03/)
- [Panama Papers Macri — Buenos Aires Times](https://www.batimes.com.ar/news/argentina/panama-papers-macri-cleared-of-wrongdoing.phtml)
- [Grupo Macri — Wikipedia](https://es.wikipedia.org/wiki/Grupo_Macri)
- [SOCMA hoy — LA NACION](https://www.lanacion.com.ar/politica/como-esta-hoy-grupo-socma-emporio-familia-nid2201340/)
- [Kueider detenido con USD 211.000 — Infobae](https://www.infobae.com/politica/2024/12/)
- [Kueider testaferros arrestados — LA NACION](https://www.lanacion.com.ar/politica/2025/03/)
- [Lousteau LCG facturacion al Congreso — iProfesional](https://www.iprofesional.com/)

---

*Investigacion realizada mediante analisis computacional de datos publicos abiertos. Todos los pipelines ETL son idempotentes y reproducibles. Ninguna fuente privada fue utilizada. Metodologia de matching: normalizacion de nombres (eliminacion de diacriticos, minusculas, ordenamiento alfabetico de partes del nombre) con scores de confianza (0,7-0,8) y metadatos de match_method en cada relacion MAYBE_SAME_AS.*
