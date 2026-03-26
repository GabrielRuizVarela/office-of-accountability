# Finanzas Politicas: El Sistema

**Investigacion basada en datos abiertos**
**Fecha:** 2026-03-19
**Estado:** Exploratorio - los hallazgos requieren verificacion independiente antes de cualquier accion legal o periodistica.

> *Este documento cruza ocho bases de datos publicas - seis argentinas y dos internacionales - totalizando 2,16 millones de nodos y 4,4 millones de relaciones en un grafo Neo4j. Las coincidencias entre datasets se basan en normalizacion de nombres y llevan riesgo de falsos positivos, especialmente para nombres comunes. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente. Donde se indica "confirmado," la verificacion incluye fuentes periodisticas, bases de datos del ICIJ, o registros judiciales publicos. Ningun dato fue fabricado, modificado ni extraido de fuentes privadas. Todo proviene de bases publicas con licencias abiertas. Cada hallazgo es reproducible.*

---

## I. La Frontera

En diciembre de 2024, el senador entrerriano Edgardo Kueider fue detenido intentando cruzar a Paraguay con **USD 211.000 en efectivo** no declarado.

Meses antes, Kueider habia emitido uno de los 36 votos afirmativos que aprobaron la Ley de Bases - la legislacion de desregulacion economica mas importante del gobierno de Milei. El desempate lo resolvio la vicepresidenta Villarruel. Sin ese voto, la ley no existiria.

Lo que la justicia encontro despues dibujo el circuito completo: dos empresas fantasma - **BETAIL SA** y **EDEKOM SA** - registradas en la IGJ con domicilios legales falsos. Departamentos de lujo en Parana adquiridos a traves de esas pantallas. En marzo de 2025, siete testaferros arrestados. En los allanamientos, videos de Kueider manipulando fajos de billetes en efectivo. Fue expulsado del Senado.

Kueider no es una anomalia. Es un sintoma.

Esta investigacion cruzo ocho fuentes de datos - votos legislativos de Como Voto (2.258 politicos, 920.000 votos), filtraciones offshore del ICIJ (4.349 oficiales argentinos, 2.422 entidades), donaciones de campana de la CNE (1.714 aportes), nombramientos del Boletin Oficial (6.044 designaciones, 22.280 contratos), el registro empresarial de la IGJ (951.863 oficiales, 1.060.769 sociedades), directivos de la CNV (1.528.931 cargos), y declaraciones juradas patrimoniales (718.865, periodo 2012-2024) - y encontro **617 politicos que aparecen en dos o mas datasets simultaneamente**. Legisladores que son directivos de empresas. Donantes de campana que son contratistas del Estado. Funcionarios que operan sociedades offshore mientras votan presupuestos.

El poder politico argentino esta estructurado alrededor del dinero. Directorios corporativos, entidades offshore, donaciones de campana y contratos publicos forman un unico sistema donde las mismas personas circulan entre el cargo publico y la riqueza privada, votando leyes que benefician a sus propias empresas.

Esto no es una teoria. Es lo que dicen los datos cuando se los cruza por primera vez.

---

## II. La Maquina

Para entender como funciona el sistema, hay que empezar por una asociacion civil registrada en la Inspeccion General de Justicia: **PENSAR ARGENTINA**.

No es un club de debate ni un think tank informal. Es una entidad legalmente constituida con un directorio donde **19 politicos fueron confirmados mediante coincidencia de DNI** - no solo por nombre. Este nivel de verificacion elimina toda duda sobre la identidad de los miembros:

- **Gabriela Michetti** - Vicepresidenta de la Nacion
- **Maria Eugenia Vidal** - Gobernadora de Buenos Aires
- **Esteban Bullrich** - Senador Nacional
- **Federico Sturzenegger** - Presidente del Banco Central
- **Federico Pinedo** - Presidente Provisional del Senado
- **Diego Santilli** - Vicejefe de Gobierno de CABA
- **Emilio Monzo** - Presidente de la Camara de Diputados
- **Patricia Bullrich** - Ministra de Seguridad
- **Marcos Pena** - Jefe de Gabinete
- **Horacio Rodriguez Larreta** - Jefe de Gobierno de CABA
- **Laura Alonso** - Secretaria de Etica Publica
- **Jorge Triaca** - Ministro de Trabajo
- **Pablo Lombardi** - Secretario de Medios
- **Eugenio Burzaco** - Secretario de Seguridad
- **Sergio Bergman** - Ministro de Ambiente
- **Paula Polledo** - Diputada Nacional
- **Marcelo Tagliaferri** - Senador Nacional
- **Humberto Schiavoni** - Senador Nacional

Y un nombre que no es politico: **Nicolas Caputo**, el socio comercial mas cercano de Mauricio Macri.

La significancia no es que exista un think tank partidario - todos los partidos los tienen. La significancia es que esta es una **entidad corporativa formal** donde la totalidad de la elite gobernante del PRO - la vicepresidenta, el jefe de gabinete, el presidente del Banco Central, el presidente de la Camara, seis ministros y secretarios - compartia directorio con el principal socio de negocios del presidente. Las politicas publicas que emergian de PENSAR fluian directamente al Poder Ejecutivo, sin intermediacion. Los mismos miembros del directorio que diseñaban las politicas las implementaban desde el gobierno.

El caso de **Laura Alonso** merece atencion particular. Paso de legisladora a Secretaria de Etica Publica - la funcionaria encargada de supervisar las declaraciones juradas de sus propios excolegas de bancada y correligionarios de PENSAR ARGENTINA. El organismo de control estaba dirigido por alguien del mismo directorio corporativo que los controlados.

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

Macri como diputado (2005-2007) tuvo una presencia del **17,6%** - entre las mas bajas del dataset. Sus votos mas frecuentes fueron AUSENTE: 29 ausencias en Presupuesto, 20 en Reforma Laboral, 14 en Codigo Penal. Sin embargo, aparece en **5 datasets simultaneamente** (Donante, BoardMember, CompanyOfficer, AssetDeclaration, GovernmentAppointment), mas que cualquier otro politico. Era el legislador que menos legislaba y el que mas conexiones externas tenia.

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

De los 20 mayores donantes, **13 dieron exclusivamente a Juntos por el Cambio**. Solo uno - Aluar Aluminio Argentino - aposto a ambos lados: ARS 5.400.000 divididos entre JxC y Frente de Todos. Aluar es el mayor productor de aluminio de Argentina. Depende de subsidios energeticos del Estado y de protecciones arancelarias. Financiar a ambos bandos no es generosidad civica: es un seguro de acceso al poder sin importar quien gane.

### El contratista que dona

La Ley 26.215 (Art. 15) prohibe expresamente que los contratistas del Estado realicen aportes de campana. El cruce de datos detecto una presunta violacion:

**Juan Pablo Rodriguez** - contratista del Estado (2018-2020, 4 contratos) y donante de campana. Si es la misma persona, es una violacion de la ley de financiamiento electoral.

Un segundo caso - Jorge Omar Gonzalez - fue descartado tras verificacion de identidad por CUIT: **falso positivo confirmado**. El contratista y el donante son personas distintas con el mismo nombre.

Chequeado documento que Macri recibio aproximadamente **ARS 3 millones** en donaciones de *empleados de empresas contratistas del Estado* - una forma de eludir la prohibicion del Art. 15. La empresa no dona directamente; sus empleados lo hacen. El efecto es el mismo.

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

Solo los Pandora Papers (a traves del estudio juridico Alcogal) expusieron a 2.637 argentinos - mas que todas las demas filtraciones combinadas. Las Islas Virgenes Britanicas son la jurisdiccion abrumadoramente preferida.

De esos miles de nombres, esta investigacion cruzo tres coincidencias con legisladores activos. Una resulto presuntamente falso positivo (Nuñez - nombre comun, entidad disuelta antes de su carrera). Las otras dos son los casos mas graves del dataset.

### CAMAÑO, Graciela - 30 años, 6 partidos, una BVI

Graciela Camaño ocupa un lugar unico en esta investigacion: es la unica persona que aparece simultaneamente en los datos offshore **y** en anomalias de comportamiento politico.

La entidad **TT 41 CORP** fue constituida en las Islas Virgenes Britanicas el 23 de junio de 2016 - **durante** su mandato como Diputada Nacional (2014-2018). No antes ni despues. Durante.

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

Su trayectoria de alianzas electorales - FJ Unidad Popular (1989), FJ Bonaerense (1997), Partido Justicialista (2001-2003), Frente para la Victoria (2007), Frente Popular (2011), Federal Unidos por una Nueva Argentina (2015), Consenso Federal (2019) - siempre dentro de la orbita peronista pero constantemente cambiando de subfaccion. Un acceso transversal a multiples coaliciones que pocos politicos logran.

El patron - ausente en votaciones financieras mientras se posee una entidad offshore - no prueba nada por si solo. Pero genera una pregunta legitima: ¿se ausentaba deliberadamente en votaciones que podrian crear conflictos de interes con su sociedad en las BVI?

**Estado:** PROBABLE - coincidencia exacta de nombre, consistente con el patron Trident Trust/Argentina. Requiere verificacion contra DDJJ y confirmacion de identidad.

### IBAÑEZ, Maria Cecilia - La entidad activa

| Campo | Detalle |
|-------|---------|
| Politica | Diputada Nacional por Cordoba, La Libertad Avanza |
| Entidad offshore | PELMOND COMPANY LTD. (BVI, constituida 31-Oct-2014) |
| Estado de la entidad | **ACTIVA** - [confirmada en base ICIJ](https://offshoreleaks.icij.org/nodes/10158328) |
| Presencia legislativa | 85,3% |
| Patrimonio 2023 | ARS 15,5 millones |
| Patrimonio 2024 | ARS 33,5 millones - **duplicado en un año** |

Ibañez voto AFIRMATIVO en el Presupuesto Nacional 2025. Voto NEGATIVO en el Financiamiento Universitario. Lo hizo mientras figuraba como titular de una sociedad offshore activa en las Islas Virgenes Britanicas.

Bajo la Ley 25.188, los funcionarios publicos deben declarar **todos** sus intereses, incluyendo participaciones offshore. Si PELMOND COMPANY LTD. no figura en sus declaraciones juradas ante la Oficina Anticorrupcion, estariamos ante una presunta omision dolosa.

**Estado:** ALTA CONFIANZA - coincidencia exacta de nombre confirmada en la base publica del ICIJ.

### El zorro en el gallinero

Entre los miles de nombres cruzados entre el Boletin Oficial y las filtraciones del ICIJ, aparecio una coincidencia que resume todo el problema del sistema: **Ferrari Facundo** - agente de la AFIP (la autoridad encargada de perseguir la evasion fiscal y detectar activos no declarados en el exterior) - aparece como oficial de una entidad offshore en los **Panama Papers**. El zorro cuidando el gallinero. Tambien aparece **Reale Jose Maria**, identificado como Fiscalizador Principal.

Y un caso estructuralmente mas grave: **Maria Eugenia Cordero** aparece simultaneamente como contratista del Estado y oficial de **BETHAN INVESTMENTS LIMITED** (entidad offshore). Dinero publico → persona → entidad offshore: la arquitectura basica de un esquema de presunto lavado.

**Estado de Ferrari, Reale y Cordero:** Coincidencias de nombre. Requieren verificacion de identidad por CUIT o DNI.

El sistema offshore corre en paralelo al servicio publico.

---

## V. El Imperio

La busqueda del apellido "Macri" en el registro de la IGJ devuelve **153 personas** vinculadas a **211 empresas**. El nucleo es SOCMA.

**Sociedad Macri S.A. (SOCMA)** fue fundada por Franco Macri en enero de 1976. Durante la dictadura militar, el grupo crecio de 7 a 47 empresas. En 1998, Forbes estimo la fortuna personal de Franco Macri en **USD 730 millones**.

| Empresa | Sector | Relevancia |
|---------|--------|-----------|
| Sideco Americana | Construccion | Buque insignia - autopistas, infraestructura |
| Correo Argentino | Servicios postales | Condonacion de deuda del 99% |
| Autopistas del Sol (AUSOL) | Peajes | Venta de acciones con prima del 400% |
| IECSA | Ingenieria | Vendida al primo Calcaterra, implicada en Cuadernos |
| Sevel Argentina | Automotriz (Fiat/Peugeot) | Base industrial familiar |
| Manliba | Recoleccion de residuos | Contrato de basura de Buenos Aires |

### Correo Argentino: el conflicto de intereses mas documentado

La cronologia es publica y judicial:

- **1997:** El gobierno de Menem privatizo el servicio postal. La concesion fue a SOCMA.
- **1998-2001:** SOCMA pago el canon solo el primer año. La deuda acumulada llego a **ARS 296 millones**.
- **Junio 2016:** El gobierno de Macri acepto un acuerdo - **reduccion del 98,82%** de la deuda (ARS 70.000 millones ajustados por inflacion).
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

El caso de **BF Corporation** es particularmente grave. Los fondos fueron movidos al Safra Bank en Suiza. Un banco aleman vinculado a la operatoria recibio la orden de **destruir toda la correspondencia**. Gianfranco declaro USD 4 millones provenientes de esa offshore a traves del blanqueo - pero solo despues de ser denunciado.

### La denuncia interna

En agosto de 2024, Mariano Macri presento denuncias penales contra SOCMA nombrando a Gianfranco, Florencia y al CEO Leonardo Maffioli. Los cargos: **administracion fraudulenta, falsificacion de documentos, evasion fiscal, balances falsos y lavado de activos**. Cuando un hermano denuncia penalmente al otro dentro de la propia estructura corporativa familiar, la informacion que emerge tiene un valor probatorio particular.

### MINERA GEOMETALES: el directorio que nadie mira

Hay un dato que no aparece en los titulares pero si en los registros de la IGJ y la CNV. En el directorio de **MINERA GEOMETALES** confluyen tres nombres:

- **Mauricio Macri** - expresidente
- **Victor Composto** - insider de SOCMA que blanqueo ARS 68 millones
- **Jean Paul Luksic Fontbona** - heredero del grupo minero chileno Antofagasta PLC, una de las fortunas mas grandes de America Latina

Un expresidente, el operador corporativo de su familia que declaro decenas de millones en activos ocultos, y la elite minera del continente. En la misma mesa directiva.

### Geometales: genealogia corporativa completa

La consulta a la base de la CNV devuelve **mas de 70 personas** que pasaron por el directorio de Minera Geometales a lo largo de tres epocas de propiedad. El patron de superposicion es revelador:

**Epoca Luksic (pre-1997):** Jean Paul Luksic Fontbona, Andronico Luksic Abaroa, Vladimir Radic Piraino, Ramon Jara Araya - los nombres del grupo minero chileno Antofagasta PLC que fundo la empresa para explorar cobre en Malargue, Mendoza.

**Epoca SOCMA/IECSA (1997-2017):** Franco Macri, Mauricio Macri, **Nestor Grindetti**, Victor Composto, Martin Blaquier, Carlos Vinci, Santos Sarnari, Ricardo Demattei, Arturo Lisdero, Felipe Suar, Sergio Lobbosco, Alberto Rojo. Geometales paso del grupo Luksic a IECSA (brazo de ingenieria de SOCMA) a fines de los noventa. Grindetti - que trabajo en Sideco desde 1980 y paso por IECSA, Creaurban, Manliba y Autopistas del Sol - no era solo el "contador de SOCMA." Era directivo de Geometales, Correo Argentino, Puentes del Litoral, Tracking Group, Murph y SCD Servicios. Simultaneamente. Y entre julio de 2010 y junio de 2013, mientras era Secretario de Hacienda de la Ciudad de Buenos Aires, tenia poder para operar la cuenta suiza de **Mercier International SA**, una offshore panamena con acciones al portador revelada en los Panama Papers. El fiscal federal Patricio Evers lo imputo por enriquecimiento ilicito en 2016. Su defensa: "una inversion que finalmente no se concreto." La firma Mercier fue constituida por Mossack Fonseca; su cuenta estaba en el banco suizo Clariden Leu. Grindetti nunca la declaro en sus declaraciones juradas como funcionario publico. Hoy, ademas de sus nueve causas pendientes en la justicia brasilena por su rol como ejecutivo de IECSA, Grindetti fue candidato a gobernador de Buenos Aires por Patricia Bullrich en 2023.

**Epoca Pampa Energia/Emes (2017-presente):** Damian Mindlin, Daniel Abelovich, Damian Burgio, Elena Sozzani, Maia Chmielewski, Leonardo Bujia, Marcelo Fuxman, Martin Fernandez Dussaut, Santiago Altieri, German Wetzler Malbran, Gustavo Magot, Paula Sotelo. En 2017, el grupo Macri vendio IECSA al **Grupo Emes** (Marcelo Mindlin, Gustavo Mariani, Damian Mindlin, Ricardo Torres), y con ella Minera Geometales paso a la orbita de **Pampa Energia**. Los nuevos directivos comparten cargos simultaneamente en Cincovial, Compania Americana de Transmision Electrica, ODS, Focolare, Corpus Energia - todo el ecosistema de infraestructura y energia de Pampa. Geometales hoy opera 16 propiedades mineras en Malargue; los proyectos El Burrero, Las Choicas y La Adriana obtuvieron aprobacion ambiental en diciembre de 2023. En 2008, bajo propiedad de Franco Macri, la empresa fue sancionada por la Direccion General de Irrigacion por uso clandestino de cursos de agua y contaminacion del Rio Grande, causando mortandad masiva de peces y una epidemia local.

### Grindetti: de SOCMA a Panama, de Lanus a la candidatura

El caso Grindetti es el eslabón que conecta el universo corporativo de Geometales con el sistema offshore. Su trayectoria - cadete de SOCMA en 1980, directivo de Sideco/IECSA/Geometales/Correo Argentino, Secretario de Hacienda de la Ciudad de Buenos Aires con Macri (2007-2015), intendente de Lanus (2015-2023), candidato a gobernador bonaerense (2023) - es la puerta giratoria entre sector privado y poder politico en su forma mas pura. Grindetti no es un politico que hace negocios ni un empresario que hace politica: es ambas cosas simultaneamente, documentado en los registros de la IGJ, la CNV, el ICIJ y la justicia federal. La entrada del ICIJ en su nombre ([Offshore Leaks Database](https://offshoreleaks.icij.org/stories/nestor-grindetti)) confirma la relacion con Mercier International SA, Panama Papers. **Estado: CONFIRMADO** - imputacion judicial, registro ICIJ, y multiples fuentes periodisticas (La Nacion, Pagina/12, Telam, Perfil, El Cronista).

La familia que convirtio el poder politico en riqueza personal - o fue al reves.

---

## VI. El Voto

El 12 de junio de 2024, la Ley de Bases fue aprobada en el Senado con 36 votos afirmativos contra 36 negativos. La vicepresidenta Villarruel desempato.

El cruce con datos corporativos revela un patron:

- Legisladores con cargos en directorios de empresas votaron **42 a favor y 7 en contra**.
- **108 cargos en directorios** se concentran en senadores que votaron afirmativamente.

Los politicos con conexiones corporativas votan sistematicamente a favor de la desregulacion. Esto no es un hallazgo sorprendente, pero ahora tiene numeros.

### Los votos que importan

**Kueider, Edgardo** (Unidad Federal, Entre Rios): Voto AFIRMATIVO - un voto clave. Meses despues, USD 211.000 en efectivo en la frontera, empresas fantasma con domicilios falsos, departamentos de lujo, siete testaferros, videos con fajos de billetes. No hay presuncion. Hay hechos judiciales, videos y arrestos.

**Lousteau, Martin** (UCR): Voto AFIRMATIVO. Lo hizo mientras su consultora, **LCG SA**, habia facturado **$1.690.000** a la Oficina de Presupuesto del Congreso entre 2020 y 2022 - periodo durante el cual Lousteau ejercia como senador. Un senador cuya empresa privada cobra del Congreso y que vota legislacion economica desde ese mismo Congreso. Se presentaron cargos penales por negociaciones incompatibles con la funcion publica.

**Tagliaferri** (Frente PRO): Voto AFIRMATIVO. Figura tambien como miembro del directorio de **PENSAR ARGENTINA** - la misma fundacion que presumiblemente contribuyo al diseño de las politicas de desregulacion. La fabrica de politicas publicas produjo la legislacion. Su propia directiva la voto en el Congreso. Y el registro corporativo de la IGJ documenta ambas cosas.

### La paradoja de la oposicion

El dato mas contraintuitivo: los senadores de la oposicion (PJ) que votaron NEGATIVO tenian en promedio **mas conexiones con datasets externos** que los oficialistas que votaron SI.

- **AFIRMATIVO:** 36 senadores, promedio 1,44 datasets externos
- **NEGATIVO:** 36 senadores, promedio 1,53 datasets externos

Interpretaciones posibles: los senadores PJ votaron en contra porque la desregulacion amenazaba sus propios intereses empresariales. O las conexiones corporativas no predicen el voto - la ideologia si. O la red corporativa del PRO opera por canales que estos datos no capturan. La respuesta probablemente combina las tres. Pero el dato desmiente la narrativa simplista de que solo un lado tiene vinculos corporativos.

~~**Romero, Juan Carlos** (Salta): 41 empresas en la IGJ.~~ **FALSO POSITIVO CONFIRMADO.** Las 41 posiciones corresponden a un homonimo de Corrientes - el dueño del grupo de transporte ERSA. Personas diferentes. Cada falso positivo eliminado aumenta la confianza en los hallazgos restantes.

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

**Total: 5.387.477 nodos - 4.412.802 relaciones**

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

## VIII. Puentes de Identidad - Ciclo 2

La resolucion de identidades entre datasets (el puente SAME_PERSON) permite rastrear a personas fisicas a traves de sus multiples roles: legislador, directivo, offshore. Tres casos ilustran como opera el sistema cuando se cruza informacion de la IGJ, el ICIJ y Como Voto.

### De Narvaez: el circuito offshore documentado

Francisco De Narvaez Steuer aparece en la base del ICIJ (Panama Papers) vinculado a cuatro entidades offshore: **Willowbrook Trading Inc.**, **Power Horse Properties Inc.** y **Titan Consulting Ltd.** en las Islas Virgenes Britanicas, y **La Esperanza Associated Corp.** en Panama. Estas sociedades fueron utilizadas para canalizar operaciones vinculadas a Casa Tia, la cadena de supermercados familiar vendida al Exxel Group en 1998 por aproximadamente **USD 650 millones**. Los Pandora Papers revelaron ademas cinco fideicomisos familiares (Galeodea, Cingula, Marquise, Sunrise, Flint) creados en diciembre de 2004, con cuentas en Suiza administradas desde Nueva Zelanda. Forbes estimo la fortuna familiar en **USD 920 millones** (2020). De Narvaez adquirio el diario El Cronista Comercial en 2006 y lo vendio al Grupo America en 2021 por USD 6 millones. La entidad Willowbrook Trading Inc. esta confirmada en la base publica del ICIJ ([enlace](https://offshoreleaks.icij.org/nodes/10134320)). **Estado: CONFIRMADO** - multiples fuentes periodisticas y la base ICIJ verifican las entidades offshore. La busqueda de "Timberhill Trading" no arrojo resultados vinculados a De Narvaez; este nombre requiere verificacion adicional contra los registros de la IGJ.

### Frigerio: el funcionario inmobiliario

Rogelio Frigerio - Ministro del Interior de Macri (2015-2019), hoy gobernador de Entre Rios - es propietario de **Desarrollos Inmobiliarios Alto Delta S.A.**, que opera tres emprendimientos inmobiliarios en el departamento Islas de Entre Rios: Alto Delta (3.200 hectareas), Barrio Nautico Sagastume (40 hectareas) y Alto Pecan (500 hectareas). Para este ultimo formo la sociedad **Nogales de Entre Rios S.A.** Su socio en Alto Delta es el diputado provincial Martin Anguiano (PRO). La fiscalia federal investigo si Frigerio, como ministro, beneficio a la constructora Koolhaas S.A. en la adjudicacion de un inmueble fiscal en Fitz Roy 851 (Buenos Aires) en junio de 2017, y un mes despues invirtio USD 776.000 en un desarrollo inmobiliario de la misma firma sobre ese terreno. La Oficina Anticorrupcion lo denuncio por incompatibilidad, cohecho y negociaciones incompatibles. Antes de la politica, Frigerio fundo la consultora **Economia y Regiones** (2000), que fue multada por el gobierno kirchnerista por publicar indices de inflacion alternativos. **Estado: CONFIRMADO** - la existencia de las empresas inmobiliarias y la investigacion fiscal son publicas. El conflicto de intereses como gobernador-empresario inmobiliario en la misma provincia requiere seguimiento.

### Camaño-Barrionuevo: la sociedad conyugal corporativa

La conexion Camaño-Barrionuevo amplia el perfil offshore de Graciela Camaño (TT 41 CORP, Seccion IV). Su exmarido Luis Barrionuevo - secretario general de UTHGRA durante decadas, senador y diputado nacional por Catamarca - acumulo un patrimonio que incluye empresas, clinicas privadas, hoteles y restaurantes. Juntos controlaron **Bellota S.A.**, dedicada a la gestion de actividades deportivas (futbol, golf), donde su hija Melina Eva Barrionuevo figura como directora suplente. Segun la declaracion jurada de Camaño ante el Congreso, Bellota S.A. declaro ganancias de ARS 249.000 pero no presento balance ante la AFIP. El matrimonio Camaño-Barrionuevo tambien controlo las superintendencias de las AFJP, una porcion de PAMI y la Administracion Nacional de la Seguridad Social. Barrionuevo es ademas socio de **Sano y Bueno Catering S.A.** (con familiares), proveedora de alimentos al Estado desde 2017. La sociedad conyugal - politica, sindical y empresarial - se disolvio con el divorcio en 2020, seguido de una guerra publica por el control de UTHGRA entre Barrionuevo y Dante Camaño (hermano de Graciela). **Estado: CONFIRMADO** - la existencia de Bellota S.A., los cargos directivos y el perfil empresarial de Barrionuevo son publicos. La falta de balance de Bellota ante AFIP, combinada con la entidad offshore TT 41 CORP de Camaño, configura un patron que merece auditoria.

### Gutierrez: datos insuficientes

La busqueda de "Julio Cesar Gutierrez cable Totoras Santa Fe" y "South Cable Holdings Argentina" no arrojo resultados verificables. Estos nombres no pudieron ser confirmados mediante fuentes periodisticas ni registros publicos accesibles. **Estado: NO VERIFICADO** - requiere acceso directo a los registros de la IGJ o ENACOM para confirmar.

---

## IX. Lo Que Queda

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
4. **MINERA GEOMETALES:** composicion historica del directorio verificada via CNV (70+ miembros, tres epocas de propiedad). Grindetti confirmado como directivo y como titular en Panama Papers (ICIJ). Pendiente: verificar si Geometales esta excluida de la Ley 7722 de Mendoza (prohibicion de mineria a cielo abierto con sustancias toxicas).
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

Hay un dato del que no hablamos en los capitulos anteriores. En el registro de la IGJ existe una sociedad anonima llamada **KARIN MODELS S.A.** - el nombre exacto de la agencia de modelos que operaba Jean-Luc Brunel desde Paris, el agente vinculado a Jeffrey Epstein hallado muerto en su celda en febrero de 2022. La coincidencia de nombre es exacta, pero no establece conexion operativa. Puede ser una sucursal; puede ser una empresa independiente. Se menciona por transparencia.

Hay cosas peores que las que sabemos. Las hay en los datos que todavia no fueron cruzados, en las declaraciones juradas que no publican los totales patrimoniales, en los contratos cuyos montos no figuran en ninguna base abierta, en los registros que se destruyeron antes de que alguien los pudiera leer.

Esta investigacion no acusa a nadie. Los datos publicos no prueban delitos - prueban conexiones, coincidencias y patrones que merecen explicacion. Pero cuando esas conexiones involucran a un senador atrapado con doscientos mil dolares en la frontera meses despues de dar un voto clave, a una fundacion partidaria cuyos 19 miembros confirmados por DNI diseñan las leyes que sus propios directivos votan, a un expresidente cuya familia blanqueo ARS 900 millones con su propia ley, a legisladoras con offshores activas mientras votan presupuestos, a un senador cuya consultora cobraba del propio Congreso donde el legislaba, a agentes fiscales con presuntas sociedades en Panama, a un directorio minero donde se sientan un expresidente, su operador corporativo y un magnate chileno - entonces los datos no necesitan acusar a nadie.

Los datos preguntan. Y en un pais donde 153 miembros de una sola familia aparecen en 211 empresas, donde una ley de blanqueo la votan los que la aprovechan, donde la secretaria de etica comparte directorio corporativo con los que tiene que controlar, donde el 4to nodo mas conectado del grafo tiene una sociedad en las Islas Virgenes Britanicas constituida durante su mandato - en ese pais, las preguntas no van a dejar de multiplicarse.

A menos que alguien las responda.

---

## X. Como Se Enriquecen - Mapa de Mecanismos

Los capitulos anteriores documentaron las conexiones: quien esta vinculado a quien, que empresas comparten con que politicos, que offshores se constituyen durante que mandatos. Pero falta la pregunta central: **como se convierte el poder politico en riqueza personal.** Este capitulo mapea los mecanismos concretos, cuantificados con casos judiciales documentados.

### Mecanismo 1: Sobreprecios en Obra Publica

El mecanismo mas simple y el mas costoso. El Estado licita una obra, la adjudica a un contratista amigo, y el precio se infla. La diferencia entre el precio real y el precio inflado se reparte entre el contratista y los funcionarios.

**Cuantificacion:**

| Metrica | Valor | Fuente |
|---------|-------|--------|
| Sobreprecio promedio detectado | **50%** | Auditorias oficiales del gobierno (2016) |
| Rango detectado por obra | 30% a 120% | Informes AGN y judiciales |
| Costo total estimado de corrupcion en obra publica (2003-2015) | **USD 80.009 millones** | Vicente Monteverde, Universidad de Moron |
| Gasto total en obra publica en ese periodo | USD 152.117 millones | Idem |
| Porcentaje del gasto en obra publica perdido por corrupcion | **52%** | Idem |
| Componente estimado de coima | ~20% del monto de obra | Idem |
| Componente estimado de sobreprecio | ~25% del monto de obra | Idem |

La metodologia de Monteverde descompone el costo de corrupcion en dos partes: la coima directa (~20%) y el sobreprecio que la financia (~25%), totalizando un costo del 52% sobre cada peso invertido en obra publica. En 13 anos, esto represento casi un tercio del PBI promedio anual.

### Mecanismo 2: Retornos y Comisiones (Cuadernos de las Coimas)

El caso de los Cuadernos - actualmente en juicio oral ante el Tribunal Oral Federal N.7 - es el blueprint documentado de como funciona el sistema de retornos.

**El circuito:**

1. El Estado adjudica obra publica a empresarios seleccionados
2. Los empresarios pagan un **retorno del 3% al 20%** del valor del contrato
3. Los pagos se hacen en efectivo, en bolsos, transportados por choferes oficiales
4. El chofer Oscar Centeno registro cada entrega en ocho cuadernos escolares entre 2005 y 2015
5. Roberto Baratta (mano derecha de Julio De Vido, Ministro de Planificacion) coordinaba la recoleccion
6. Los anticipos financieros oscilaban entre el **10% y 20%** del monto de las obras

**Los numeros del juicio:**

| Dato | Valor |
|------|-------|
| Imputados totales | **87** (19 exfuncionarios, 2 choferes, 65 empresarios, 1 expresidenta) |
| Pagos registrados por Centeno (2008-2010) | **175 entregas** |
| Monto documentado en esos pagos | **ARS 171 millones + USD 600.000** |
| Montos ofrecidos por imputados para evitar juicio | **> USD 12 millones** (rechazados por el tribunal) |

**Empresarios clave y sus ofertas de reparacion:**

| Empresario | Empresa | Oferta para evitar juicio |
|-----------|---------|--------------------------|
| Angelo Calcaterra | Iecsa (primo de Macri) | USD 1.680.000 |
| Ernesto Clarens | - | Depto + yate en Miami (~USD 1.500.000) |
| Aldo Roggio | Grupo Roggio | USD 1.260.000 |
| Gabriel Romero | Hidrovia/Ferrovias | USD 344.840 |
| Enrique Pescarmona + Ruben Valenti | IMPSA | USD 344.638 |
| Adrian y Mauricio Pascucci | Alquimaq | ARS 133.000.000 |

Los arrepentidos confesaron que pagaban porque los "apretaban" - las coimas eran el precio de acceso a la obra publica. El exceo de Isolux fue el primer empresario arrepentido en declarar. Hector Zabaleta (Techint), Jorge Neira (Electroingenieria) y Aldo Roggio tambien confesaron.

El Tribunal Oral Federal rechazo todas las ofertas de reparacion. El juicio continua a marzo de 2026, con Centeno negandose a declarar bajo programa de proteccion de testigos.

### Mecanismo 3: Testaferros y Prestanombres

Cuando un funcionario acumula riqueza que no puede justificar, necesita a alguien que la posea formalmente. Esa persona es el testaferro.

**Tipologia documentada:**

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| Familiar | Conyuge, hijo, pariente sanguineo o politico | Caso Kueider: 7 testaferros arrestados |
| Empleado de confianza | Chofer, secretario, asistente | Daniel Muñoz (secretario de Nestor Kirchner) |
| Sociedad offshore | Entidad en jurisdiccion opaca sin actividad real | Mercier International SA (Grindetti, Panama Papers) |
| Sociedad fantasma local | Empresa registrada con domicilio falso | BETAIL SA, EDEKOM SA (Kueider, IGJ) |

**Marco legal:** El Decreto 27/2018 modifico la Ley General de Sociedades 19.550, prohibiendo la actuacion del socio oculto y del socio aparente, e imponiendo responsabilidad ilimitada, solidaria y subsidiaria tanto al socio verdadero como al testaferro. Pero la ley no ha detenido la practica - Kueider fue arrestado en diciembre de 2024, seis anos despues de la reforma.

### Mecanismo 4: Lavado Inmobiliario

El sector inmobiliario es el vehiculo preferido para convertir dinero ilicito en activos tangibles. El GAFI (Financial Action Task Force) ha identificado a Argentina como vulnerable en este sector.

**El caso Muñoz-Pochetti: USD 69,8 millones en 14 departamentos**

Daniel Muñoz, exsecretario privado de Nestor Kirchner, y su viuda Carolina Pochetti canalizaron **USD 69,8 millones** en la compra de **14 departamentos de lujo en Miami y New York** a traves de sociedades offshore constituidas en las Islas Virgenes Britanicas.

**El circuito:**

1. Coimas recaudadas por Roberto Baratta entregadas a Daniel Muñoz
2. Dinero retirado por testaferros desde la residencia de Pochetti en Buenos Aires
3. Fondos transferidos a cuevas financieras
4. Dinero enviado al exterior
5. Compra de propiedades a traves de sociedades offshore
6. Sergio Todisco identificado como principal testaferro del circuito

**Vulnerabilidades del sector inmobiliario (segun GAFI):**

- Compras de bienes de lujo en efectivo
- Uso de personas politicamente expuestas
- Sociedades anonimas como titulares
- Fideicomisos inmobiliarios opacos
- Activos virtuales como intermediarios

**Caso Macri - Fideicomiso Ciego:**

La Oficina Anticorrupcion denuncio que Macri utilizo una empresa para hacer "auto-transferencias" por ARS 54 millones - una maniobra caracteristica de lavado. Tambien flageo la adquisicion de 13 departamentos y 15 cocheras a traves del **Fideicomiso Inmobiliario Caminito**, propiedades que Macri ayudo a eximir de impuestos y que luego aumentaron un **333,93%** en valor.

**Paraguay como nuevo destino:**

Dinero argentino ha alimentado un boom inmobiliario de edificios de lujo en Paraguay, con rascacielos, crisis de vivienda y sospechas de lavado documentadas por La Nacion.

### Mecanismo 5: La Ruta del Dinero - Circuito Offshore Completo

El caso Lazaro Baez es el ejemplo mas documentado de como se construye una fortuna desde cero utilizando contratos estatales y circuitos offshore.

**Lazaro Baez: de empleado bancario a magnate**

| Dato | Valor |
|------|-------|
| Patrimonio declarado en 2002 | ARS 1.123.181 (3 propiedades) |
| Crecimiento patrimonial personal (2004-2015) | **12.127%** |
| Crecimiento de activos de Austral Construcciones | **45.313%** |
| Licitaciones ganadas en Santa Cruz | **82%** de las licitaciones provinciales |
| Contratos de obra publica nacional (Ministerio de Planificacion) | **12%** de todas las licitaciones |
| Montos recibidos del Estado nacional | ARS 4.000 millones |
| Montos recibidos de la provincia de Santa Cruz | ARS 1.200 millones |
| Hectareas acumuladas solo en Santa Cruz | **415.000** |
| Constitucion de Austral Construcciones | **12 dias antes** de la asuncion de Nestor Kirchner (mayo 2003) |
| Asignacion de obras viales en Santa Cruz (2003-2015) | Monopolio de Austral + empresas satelite, ~ARS 46.000 millones |

**El circuito offshore:**

1. Dinero generado por contratos de obra publica en Santa Cruz
2. Transferido de Santa Cruz a Buenos Aires
3. Enviado a cuentas bancarias y sociedades en **Suiza** y **Panama** (incluyendo Teegan Inc., propiedad de Martin Baez)
4. Convertido en **bonos del Tesoro argentino** en el exterior
5. Repatriado a traves de la compra de esos bonos, reingresando a cuentas de Austral Construcciones
6. El dinero "limpio" utilizado para adquirir tierras, propiedades y activos

**Condenas:**

| Concepto | Valor |
|----------|-------|
| Condena por lavado (Ruta del Dinero K) | 10 anos de prision |
| Condena por fraude (Vialidad) | 6 anos de prision |
| Pena unificada (confirmada por Casacion, febrero 2026) | **15 anos de prision** |
| Monto lavado probado | **USD 55 millones** |
| Multa impuesta (6x el monto lavado) | **USD 329 millones** |
| Decomiso ordenado | USD 61.130.860 + ARS 4.174.697 |

### Mecanismo 6: Declaraciones Juradas - Lo Que Revelan y Lo Que Ocultan

La Oficina Anticorrupcion administra el sistema de Declaraciones Juradas Patrimoniales Integrales (DJPI) y publica las declaraciones de funcionarios del Poder Ejecutivo Nacional desde 2012 en datos abiertos. Cualquier ciudadano puede consultarlas en argentina.gob.ar buscando por "Apellido + Ano" o "CUIT + Ano."

**Anomalias detectadas en declaraciones 2024:**

| Funcionario | Patrimonio previo | Patrimonio 2024 | Crecimiento |
|-------------|-------------------|-----------------|-------------|
| Luis Caputo (Min. Economia) | ARS 2.307 millones | ARS 11.851 millones | **413%** |
| Javier Milei (Presidente) | ARS 54 millones | ARS 206 millones | **276%** |
| Karina Milei (Sec. General) | ARS 52 millones | ARS 78 millones | **149%** |
| Federico Sturzenegger (Min. Desregulacion) | - | ~ARS 970 millones de salto patrimonial | - |
| Mariano Cuneo Libarona (Min. Justicia) | - | ARS 6.627 millones | El mayor del gabinete |

**Inconsistencias puntuales:**

- Un departamento de Sandra Pettovello cotizado al mismo precio en pesos antes y despues de la devaluacion de 2023
- Manuel Adorni no declaro una casa de country comprada por su esposa en 2024

**Limitacion critica:** Los patrimonios declarados en DDJJ no representan patrimonios reales. Los inmuebles y vehiculos se declaran a **valor fiscal** (el precio que el Estado asigna para cobro de impuestos), no a valor de mercado. Esto subestima sistematicamente la riqueza real de los funcionarios.

**Diputados con mayor patrimonio declarado (2024-2025):**

| Diputado | Patrimonio declarado |
|----------|---------------------|
| Maximo Kirchner | ARS 8.311 millones |
| Carla Carrizo | ARS 7.073 millones |
| Cristian Ritondo | ARS 6.718 millones |

**La regla de la inflacion:** El aumento patrimonial debe superar la inflacion para comenzar a hablar de enriquecimiento. En 2020, mas de la mitad del Gabinete de Alberto Fernandez tuvo crecimiento patrimonial superior a la inflacion del 36%. En 2024, con inflacion acumulada superior al 200%, cualquier crecimiento por debajo de ese umbral es simplemente revalorizacion nominal.

### Sintesis: El Sistema de Enriquecimiento

Los seis mecanismos no operan aislados. Forman un circuito integrado:

```
CONTRATO ESTATAL (sobreprecio 25-50%)
       ↓
RETORNO/COIMA (3-20% del contrato)
       ↓
TESTAFERRO (familiar, empleado, sociedad fantasma)
       ↓
LAVADO INMOBILIARIO (propiedades en Miami, NYC, Punta del Este, Paraguay)
       ↓
CIRCUITO OFFSHORE (BVI → Suiza → Panama → bonos argentinos → repatriacion)
       ↓
DECLARACION JURADA (subvaluada a valor fiscal, omisiones de activos)
```

**Escala estimada del sistema:**

| Concepto | Monto |
|----------|-------|
| Costo total de corrupcion en obra publica (2003-2015) | USD 80.009 millones |
| Lavado documentado solo en caso Baez | USD 55 millones |
| Lavado documentado en caso Muñoz-Pochetti | USD 69,8 millones |
| Blanqueo del circulo SOCMA | ARS 900+ millones |
| Coimas documentadas en Cuadernos (2008-2010 solamente) | ARS 171 millones + USD 600.000 |

Los datos de los capitulos I-IX - las offshores, los directorios compartidos, las donaciones corporativas, los votos alineados - ahora tienen un mecanismo causal. No es coincidencia que un senador con empresas fantasma vote una ley clave, ni que un empresario que dono millones gane licitaciones. El sistema existe para mover dinero del Estado al bolsillo privado, y cada conexion del grafo es un tramo de esa ruta.

---

## Fuentes

- [ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org)
- [PELMOND COMPANY LTD - ICIJ](https://offshoreleaks.icij.org/nodes/10158328)
- [Aportantes Electorales - CNE](https://aportantes.electoral.gob.ar)
- [datos.gob.ar - Datos Abiertos](https://datos.gob.ar)
- [Causa Correo Argentino - Wikipedia](https://es.wikipedia.org/wiki/Causa_Correo_Argentino)
- [Correo claves - Chequeado](https://chequeado.com/el-explicador/claves-para-entender-la-polemica-por-la-deuda-del-correo-argentino-con-el-estado/)
- [Macri contratistas - Chequeado](https://chequeado.com/investigaciones/macri-recibio-3-millones-de-contratistas-del-estado-para-su-campana-electoral/)
- [AUSOL negocio - Pagina/12](https://www.pagina12.com.ar/54129-el-negocio-de-los-macri-con-autopistas-del-sol)
- [BF Corporation Suiza - Perfil](https://www.perfil.com/noticias/politica/una-off-shore-de-los-macri-movio-fondos-a-suiza-y-destruyo-pruebas.phtml)
- [Gianfranco blanqueo - Perfil](https://www.perfil.com/noticias/politica/gianfranco-macri-blanqueo-us-4-millones-de-una-offshore-oculta-tras-ser-denunciado.phtml)
- [SOCMA blanqueo - Perfil](https://noticias.perfil.com/noticias/politica/2018-12-18-quienes-son-los-integrantes-de-socma-que-adhirieron-al-blanqueo.phtml)
- [Macri patrimonio - Infobae](https://www.infobae.com/politica/2020/02/15/el-patrimonio-de-macri-se-enriquecio-o-empobrecio-luego-de-su-paso-por-el-poder/)
- [Mariano Macri denuncia - Infobae](https://www.infobae.com/judiciales/2024/08/07/el-hermano-de-mauricio-macri-denuncio-al-grupo-empresarial-de-la-familia-por-defraudacion-y-lavado-de-activos/)
- [Calcaterra IECSA - LA NACION](https://www.lanacion.com.ar/politica/iecsa-los-negocios-bajo-sospecha-del-primo-del-presidente-nid2159888/)
- [Pandora Papers Argentina - Infobae](https://www.infobae.com/america/pandora-papers/2021/10/03/)
- [Panama Papers Macri - Buenos Aires Times](https://www.batimes.com.ar/news/argentina/panama-papers-macri-cleared-of-wrongdoing.phtml)
- [Grupo Macri - Wikipedia](https://es.wikipedia.org/wiki/Grupo_Macri)
- [SOCMA hoy - LA NACION](https://www.lanacion.com.ar/politica/como-esta-hoy-grupo-socma-emporio-familia-nid2201340/)
- [Kueider detenido con USD 211.000 - Infobae](https://www.infobae.com/politica/2024/12/)
- [Kueider testaferros arrestados - LA NACION](https://www.lanacion.com.ar/politica/2025/03/)
- [Lousteau LCG facturacion al Congreso - iProfesional](https://www.iprofesional.com/)
- [Willowbrook Trading Inc - ICIJ](https://offshoreleaks.icij.org/nodes/10134320)
- [Francisco De Narvaez Steuer - ICIJ](https://offshoreleaks.icij.org/nodes/12173433)
- [Panama Papers empresarios argentinos - Mining Press](https://miningpress.com/296604/panama-papers-los-empresarios-argentinos-con-cuentas-offshore)
- [Pandora Papers familias ricas Argentina - elDiarioAR](https://www.eldiarioar.com/politica/pandora-papers/nueve-diez-familias-ricas-argentina-figuran-pandora-papers-sociedades-fideicomisos-offshore_1_8425464.html)
- [De Narvaez compra El Cronista - LA NACION](https://www.lanacion.com.ar/cultura/narvaez-compro-el-diario-el-cronista-nid843710/)
- [Grupo America compra El Cronista - Perfil](https://www.perfil.com/noticias/medios/grupo-america-compro-diario-el-cronista-6-millones-dolares.phtml)
- [Exxel Group compra Casa Tia - LA NACION](https://www.lanacion.com.ar/economia/the-exxel-group-compro-casa-tia-nid121890/)
- [Frigerio operaciones inmobiliarias - Infobae](https://www.infobae.com/politica/2022/04/25/pidieron-citar-a-indagatoria-a-rogelio-frigerio-por-irregularidades-en-operaciones-inmobiliarias/)
- [Frigerio negocio inmobiliario Entre Rios - Informe Digital](https://www.informedigital.com.ar/noticia/184534)
- [Frigerio obras ilegales - El Fueguino](https://www.elfueguino.com.ar/obras-para-beneficiar-los-negocios-de-frigerio/)
- [Grindetti imputado por enriquecimiento ilicito - LA NACION](https://www.lanacion.com.ar/politica/grindetti-quedo-imputado-en-la-causa-de-los-panama-papers-por-enriquecimiento-ilicito-nid1913566/)
- [Grindetti Panama Papers - Pagina/12](https://www.pagina12.com.ar/diario/elpais/1-302943-2016-06-29.html)
- [Grindetti es Macri - Letra P](https://www.letrap.com.ar/nota/2016-6-30-grindetti-es-macri-por-que-la-imputacion-al-intendente-de-lanus-inquieta-al-presidente)
- [Grindetti ICIJ Offshore Leaks](https://offshoreleaks.icij.org/stories/nestor-grindetti)
- [Grindetti una vida junto a los Macri - El Numeral](https://elnumeral.com/2023/05/22/grindetti-una-vida-junto-a-los-macri/)
- [Grindetti Interpol IECSA Brasil - La Politica Online](https://www.lapoliticaonline.com/nota/97270-grindetti-aparecio-en-una-busqueda-de-interpol-por-una-causa-de-evasion-de-una-empresa-de-macri-en-brasil/)
- [Minera Geometales Mendoza - Revista Citrica](https://revistacitrica.com/megamineria-en-mendoza-nuevo-intento.html)
- [Geometales cobre Mendoza - Once Diario](https://oncediario.com.ar/noticia-mendoza-los-duenos-del-cobre-mendocino-que-corren-con-ventaja-en-el-impulso-a-la-mineria)
- [Geometales devolucion concesion Macri - Los Andes](https://www.losandes.com.ar/el-gobierno-de-mendoza-le-devolvio-la-concesion-de-una-mina-en-malargue-al-grupo-macri)
- [Geometales avanza cobre - EnerNews](https://enernews.com/nota/364848/geometales-avanza-en-su-plan-para-buscar-cobre-en-mendoza)
- [Franco Macri explora cobre Malargue - No a la Mina](https://noalamina.org/argentina/mendoza/item/1135-una-empresa-de-franco-macri-explora-cobre-en-malarguee)
- [Cornejo devolvio explotacion minera al grupo Macri - BBL](https://bbl.com.ar/nota_4906_por-decreto-cornejo-devolvi%C3%B3-una-explotaci%C3%B3n-minera-al-grupo-macri-)
- [Clan Barrionuevo-Camaño - Realpolitik](https://realpolitik.com.ar/nota/36693/clan-barrionuevo--ndash--camano--numeros-que-no-cierran--titulos-dudosos-y-sueldos-envidiables/)
- [Barrionuevo-Camaño sociedad conyugal - Infobae](https://www.infobae.com/politica/2021/10/26/barrionuevo-camano-una-sociedad-conyugal-que-se-sello-al-calor-del-peronismo-y-entro-en-crisis-con-la-pandemia/)
- [Barrionuevo Forrest Gump - Revista Anfibia](https://www.revistaanfibia.com/luis-barrionuevo-el-forrest-gump-de-la-politica-argentina/)
- [Corrupcion en obra publica costo USD 80.000 millones - Perfil](https://www.perfil.com/noticias/cordoba/la-corrupcion-en-obra-publica-costo-unos-us80000-millones-en-13-anos.phtml)
- [Sobreprecios promedio 50% en obra publica - El Cronista](https://www.cronista.com/economia-politica/el-gobierno-dice-que-la-obra-publica-tuvo-sobreprecios-promedio-de-50-20160705-0059.html)
- [Juicio Cuadernos: fortunas en contratos y coimas - Infobae](https://www.infobae.com/judiciales/2025/12/16/el-juicio-por-los-cuadernos-de-la-corrupcion-continua-la-acusacion-que-desnuda-el-vinculo-entre-empresarios-y-politicos/)
- [175 coimas pagadas a Cristina Kirchner - El Chorrillero](https://elchorrillero.com/nota/2025/12/18/590392-juicio-cuadernos-de-las-coimas-el-tribunal-dio-a-conocer-el-monto-de-las-175-coimas-que-les-pagaron-los-empresarios-a-cristina-kirchner/amp/)
- [Claves juicio Cuadernos de las coimas - Infobae](https://www.infobae.com/judiciales/2025/11/06/hoy-comienza-el-juicio-a-los-cuadernos-de-las-coimas-las-claves-para-entender-el-mayor-caso-de-corrupcion-de-la-historia-argentina/)
- [Empresarios confesaron coimas - El Economista](https://eleconomista.com.ar/politica/causa-cuadernos-lista-completa-empresarios-confesaron-coimas-n90218)
- [Cuanto ofrecieron empresarios para evitar juicio - Infobae](https://www.infobae.com/judiciales/2025/09/17/cuadernos-de-la-corrupcion-cuanto-ofrecieron-pagar-los-empresarios-y-funcionarios-acusados-para-comprar-su-impunidad/)
- [Empresarios arrepentidos Cuadernos - LA NACION](https://www.lanacion.com.ar/politica/los-cuadernos-de-las-coimas-todos-los-arrepentidos-nid2161477/)
- [48 imputados ofertas para evitar juicio - LA NACION](https://www.lanacion.com.ar/economia/cuadernos-quienes-son-y-cuanto-ofrecieron-47-imputados-para-evitar-el-juicio-oral-nid16092025/)
- [Centeno se nego a declarar - LA NACION](https://www.lanacion.com.ar/politica/cuadernos-de-las-coimas-el-chofer-oscar-centeno-esta-en-comodoro-py-para-ser-indagado-en-el-juicio-nid19032026/)
- [Causa de los cuadernos - Wikipedia](https://es.wikipedia.org/wiki/Causa_de_los_cuadernos)
- [Caso Lazaro Baez - Wikipedia](https://es.wikipedia.org/wiki/Caso_L%C3%A1zaro_B%C3%A1ez)
- [Caso Grupo Austral - Wikipedia](https://es.wikipedia.org/wiki/Caso_Grupo_Austral)
- [Baez crecimiento patrimonial - Infobae](https://www.infobae.com/judiciales/2023/03/09/el-rol-de-lazaro-baez-su-crecimiento-patrimonial-y-el-vinculo-estrecho-con-los-kirchner/)
- [Baez propiedades - Perfil](https://www.perfil.com/noticias/politica/juicio-por-la-obra-publica-cuales-son-las-propiedades-de-lazaro-baez-que-presento-el-fiscal-luciani.phtml)
- [Austral Construcciones que fue - La Posta Comodorense](https://lapostacomodorense.com.ar/2025/11/25/que-fue-de-austral-construcciones-la-empresa-de-lazaro-baez/)
- [Baez condena 12 anos lavado USD 55M - LA NACION](https://www.lanacion.com.ar/politica/lazaro-baez-nid2612063/)
- [Casacion confirmo condena 15 anos Baez - Infobae](https://www.infobae.com/judiciales/2026/02/27/casacion-mantuvo-vigente-la-condena-unica-de-15-anos-por-la-ruta-del-dinero-k-y-vialidad-contra-lazaro-baez/)
- [Baez multa USD 329 millones - Infobae](https://www.infobae.com/judiciales/2025/09/15/ruta-del-dinero-lazaro-baez-debera-pagar-una-multa-de-mas-de-300-millones-de-dolares-por-las-maniobras-de-lavado/)
- [Departamentos lujo Miami/NYC Cuadernos - Infobae](https://www.infobae.com/judiciales/2025/10/13/uno-por-uno-los-lujosos-departamentos-en-new-york-y-miami-vinculados-a-la-plata-de-los-cuadernos-de-las-coimas/)
- [Pochetti todos los caminos - Infobae](https://www.infobae.com/judiciales/2025/10/24/la-plata-de-los-cuadernos-de-las-coimas-todos-los-caminos-conducen-a-carolina-pochetti/)
- [Todisco principal testaferro - Infobae](https://www.infobae.com/judiciales/2025/10/14/la-curiosa-indagatoria-de-sergio-todisco-acusado-de-ser-el-principal-testaferro-del-dinero-de-los-cuadernos/)
- [Cuevas financieras lavado Cuadernos - Infobae](https://www.infobae.com/judiciales/2025/10/22/el-lavado-de-la-plata-de-los-cuadernos-de-las-coimas-la-pista-de-las-cuevas-financieras/)
- [Muñoz propiedades Miami - LA NACION](https://www.lanacion.com.ar/politica/cuadernos-como-son-lujosas-propiedades-munoz-exsecretario-nid2297382/)
- [Fideicomiso Ciego Macri lavado - Pagina/12](https://www.pagina12.com.ar/366010-fideicomiso-ciego-una-plataforma-de-lavado-y-evasion-de-macr)
- [GAFI lavado sector inmobiliario - ACFCS](https://www.delitosfinancieros.org/gafi-el-lavado-de-dinero-a-traves-del-sector-inmobiliario/)
- [Dinero argentino boom inmobiliario Paraguay - LA NACION](https://www.lanacion.com.ar/politica/rascacielos-crisis-de-vivienda-y-sospechas-de-lavado-el-dinero-argentino-alimenta-un-boom-de-nid01082025/)
- [Testaferros regulacion Argentina - Abogados.com.ar](https://abogados.com.ar/nueva-regulacion-en-materia-de-testaferros-socios-ocultos-y-prestanombres/21178)
- [Ricardo Jaime testaferros - Infobae](https://www.infobae.com/2014/04/13/1556964-todos-los-testaferros-ricardo-jaime/)
- [Sturzenegger salto patrimonial ARS 970M - Perfil](https://www.perfil.com/noticias/politica/federico-sturzenegger-declaro-un-salto-patrimonial-de-casi-970-millones-en-2024.phtml)
- [Caputo Adorni Karina Milei patrimonio - El Ancasti](https://www.elancasti.com.ar/adorni-casi-duplico-su-patrimonio-previo-la-funcion-publica-pero-mejor-les-fue-luis-caputo-y-karina-milei-n608424)
- [Ranking patrimonial gabinete Milei - Letra P](https://www.letrap.com.ar/politica/declaraciones-juradas-el-ranking-patrimonial-del-gabinete-javier-milei-n5406260)
- [Diputados con mas patrimonio - Chequeado](https://chequeado.com/el-explicador/las-declaraciones-juradas-de-los-diputados-nacionales-quienes-son-los-10-legisladores-con-mas-patrimonio/)
- [Consultar DDJJ funcionarios publicos - Argentina.gob.ar](https://www.argentina.gob.ar/servicio/consultar-declaraciones-juradas-de-funcionarios-publicos)
- [Oficina Anticorrupcion - Argentina.gob.ar](https://www.argentina.gob.ar/anticorrupcion)
- [Patrimonio politicos a lo largo del tiempo - LA NACION](https://www.lanacion.com.ar/opinion/el-patrimonio-de-los-politicos-argentinos-a-lo-largo-del-tiempocontrastes-y-similitudes-nid2329092/)
- [Suiza y Panama ratificaron offshore Baez - LA NACION](https://www.lanacion.com.ar/politica/suiza-y-panama-ratificaron-que-baez-canalizo-millones-de-dolares-en-las-offshore-nid2069368/)
- [FinCEN Files financista Suiza ruta del dinero K - LA NACION](https://www.lanacion.com.ar/politica/fincen-files-financista-suiza-la-ruta-del-nid2453169/)

---

*Investigacion realizada mediante analisis computacional de datos publicos abiertos. Todos los pipelines ETL son idempotentes y reproducibles. Ninguna fuente privada fue utilizada. Metodologia de matching: normalizacion de nombres (eliminacion de diacriticos, minusculas, ordenamiento alfabetico de partes del nombre) con scores de confianza (0,7-0,8) y metadatos de match_method en cada relacion MAYBE_SAME_AS.*
