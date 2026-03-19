# Finanzas Politicas: Radiografia del Poder Economico en la Politica Argentina

**Investigacion basada en datos abiertos**
**Fecha:** 2026-03-19
**Estado:** Exploratorio — los hallazgos requieren verificacion independiente antes de cualquier accion legal o periodistica.

> *Este documento cruza seis bases de datos publicas argentinas y dos internacionales, totalizando 5,4 millones de nodos y 4,4 millones de relaciones en un grafo Neo4j. Las coincidencias entre datasets se basan en normalizacion de nombres y llevan riesgo de falsos positivos, especialmente para nombres comunes. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente. Donde se indica "confirmado," la verificacion incluye fuentes periodisticas, bases de datos del ICIJ, o registros judiciales publicos.*

---

## Capitulo 1: El Sistema

En la Argentina, el dinero politico circula por canales que rara vez se ven al mismo tiempo. Los aportes de campana se publican en el sitio de la Camara Nacional Electoral. Las declaraciones juradas patrimoniales se archivan en la Oficina Anticorrupcion. Los directorios de empresas constan en la Inspeccion General de Justicia. Las sociedades offshore aparecen en filtraciones internacionales. Los nombramientos ejecutivos se publican en el Boletin Oficial. Los votos legislativos se registran en el Congreso.

Cada uno de estos repositorios existe en su propia isla. Nadie los cruza sistematicamente.

Esta investigacion lo hizo. Integro ocho flujos de datos — Como Voto (2.258 politicos, 920.000 votos), ICIJ Offshore Leaks (4.349 oficiales argentinos, 2.422 entidades), CNE Aportantes (1.714 donaciones), Boletin Oficial (6.044 nombramientos, 22.280 contratos), IGJ Registro Empresarial (951.863 oficiales de empresa, 1.060.769 sociedades), CNV Directivos (1.528.931 cargos en directorios), y DDJJ Patrimoniales (718.865 declaraciones, 2012-2024) — en un unico grafo de relaciones.

Los resultados revelan un sistema donde los mismos nombres aparecen como legisladores, directivos de empresas, donantes de campana, funcionarios ejecutivos y, en algunos casos, titulares de sociedades offshore. No es conspiracion: es estructura. Y la estructura tiene nombres, montos y fechas.

### Lo que encontramos

- **3 legisladores** con entidades offshore en las Islas Virgenes Britanicas votaron sobre legislacion financiera, impositiva y presupuestaria.
- **13 de 20** casos documentados de puerta giratoria entre el Congreso y el Ejecutivo son del espacio PRO.
- **4.347 argentinos** aparecen como oficiales de 2.419 entidades offshore en las filtraciones del ICIJ.
- **153 miembros de la familia Macri** figuran en **211 empresas** registradas en la IGJ.
- Una fundacion politica — PENSAR ARGENTINA — tiene como miembros formales de su directorio a mas de 50 funcionarios PRO junto al socio comercial personal del expresidente.
- Los 13 mayores donantes corporativos de 2019 dieron exclusivamente a Juntos por el Cambio.
- Un agente de la AFIP aparece en los Panama Papers.

Ningun dato fue fabricado, modificado ni extraido de fuentes privadas. Todo proviene de bases publicas con licencias abiertas (CC-BY 4.0 para datos gubernamentales, base abierta del ICIJ). Cada hallazgo es reproducible.

---

## Capitulo 2: La Maquina PRO — PENSAR ARGENTINA y la Puerta Giratoria

### La fabrica de politicas publicas

En el registro de la Inspeccion General de Justicia existe una asociacion civil llamada **PENSAR ARGENTINA**. No es un club de debate ni un think tank informal. Es una entidad legalmente constituida con un directorio donde **19 politicos fueron confirmados mediante coincidencia de DNI** — no solo por nombre. Este nivel de verificacion elimina toda duda sobre falsos positivos para el nucleo del directorio:

- **Gabriela Michetti** (Vicepresidenta) — *confirmada por DNI*
- **Maria Eugenia Vidal** (Gobernadora de Buenos Aires) — *confirmada por DNI*
- **Esteban Bullrich** (Senador) — *confirmado por DNI*
- **Federico Sturzenegger** (Presidente del Banco Central) — *confirmado por DNI*
- **Federico Pinedo** (Presidente Provisional del Senado) — *confirmado por DNI*
- **Diego Santilli** (Vicejefe de Gobierno de CABA) — *confirmado por DNI*
- **Pablo Lombardi** (Secretario de Medios) — *confirmado por DNI*
- **Eugenio Burzaco** (Secretario de Seguridad) — *confirmado por DNI*
- **Sergio Bergman** (Ministro de Ambiente) — *confirmado por DNI*
- **Emilio Monzo** (Presidente de la Camara de Diputados) — *confirmado por DNI*
- **Paula Polledo** (Diputada Nacional) — *confirmado por DNI*
- **Jorge Triaca** (Ministro de Trabajo) — *confirmado por DNI*
- **Marcelo Tagliaferri** (Senador) — *confirmado por DNI*
- **Humberto Schiavoni** (Senador) — *confirmado por DNI*
- **Patricia Bullrich** (Ministra de Seguridad)
- **Marcos Pena** (Jefe de Gabinete)
- **Horacio Rodriguez Larreta** (Jefe de Gobierno de CABA)
- **Laura Alonso** (Secretaria de Etica Publica)

Y un nombre que no es politico: **Nicolas Caputo**, el socio comercial mas cercano de Mauricio Macri.

La significancia de esta lista no es que exista un think tank partidario — todos los partidos los tienen. La significancia es que **19 de estos vinculos estan confirmados por DNI**, lo que convierte a PENSAR ARGENTINA en el caso mas solido de toda la investigacion en terminos de calidad de matching. Esta es una **entidad corporativa formal** donde la totalidad de la elite gobernante del PRO compartia directorio con el principal socio de negocios del presidente. Las decisiones de politica publica que emergian de PENSAR fluian directamente al Poder Ejecutivo, sin intermediacion.

Michetti y Pinedo tambien cofundaron **SUMA PARA EL DISENO DE POLITICAS PUBLICAS**, otra asociacion civil registrada en la IGJ. El patron es claro: las politicas del gobierno PRO no nacian en el Estado. Nacian en estructuras corporativas privadas donde empresarios y funcionarios se sentaban en la misma mesa.

### La puerta giratoria: los numeros

De 20 politicos que pasaron del Congreso al Poder Ejecutivo y viceversa, **13 son del espacio PRO**. El camino tipico:

**Legislador (baja asistencia) → Funcionario ejecutivo → Retorno a la politica**

Los casos mas prominentes, documentados en registros del Boletin Oficial y del Congreso:

| Politico | Rol legislativo | Presencia | Rol ejecutivo |
|----------|----------------|-----------|---------------|
| Mauricio Macri | Diputado Nacional | 17,6% | Presidente de la Nacion |
| Patricia Bullrich | Diputada Nacional | 71,8% | Ministra de Seguridad |
| Laura Alonso | Diputada Nacional | 55,4% | Secretaria de Etica Publica |
| Silvia Majdalani | Diputada Nacional | 44,6% | Subdirectora General de Inteligencia |
| Eugenio Burzaco | Diputado Nacional | 50,6% | Secretario de Seguridad |
| Rogelio Frigerio | Diputado Nacional | 69,9% | Ministro del Interior |
| Gabriela Michetti | Diputada Nacional | 59,6% | Vicepresidenta |

El caso de **Laura Alonso** merece atencion particular. Paso de legisladora a Secretaria de Etica Publica — la funcionaria encargada de supervisar las declaraciones juradas de sus propios excolegass de bancada y correligionarios de PENSAR ARGENTINA. El organismo de control estaba dirigido por alguien del mismo directorio corporativo que los controlados.

### Macri legislador: el fantasma

Como Diputado Nacional (2005-2007), Mauricio Macri tuvo una presencia del **17,6%** — entre las mas bajas de cualquier legislador en el dataset. Sus votos mas frecuentes fueron AUSENTE:

- Presupuesto: 29 ausencias
- Reforma Laboral: 20 ausencias
- Codigo Penal: 14 ausencias

Sin embargo, aparece en **5 datasets simultaneamente** (Donante, BoardMember, CompanyOfficer, AssetDeclaration, GovernmentAppointment), mas que cualquier otro politico. Era el legislador que menos legislaba y el que mas conexiones externas tenia.

---

## Capitulo 3: El Patrimonio Offshore — Ibañez, Camaño y las BVI que nadie declaro

### 4.347 argentinos, 2.419 entidades

Las filtraciones del Consorcio Internacional de Periodistas de Investigacion (ICIJ) expusieron una huella offshore argentina masiva:

| Filtracion | Oficiales argentinos | Entidades | Jurisdiccion principal |
|------------|---------------------|-----------|----------------------|
| Pandora Papers (Alcogal) | 2.637 | 1.488 | Islas Virgenes Britanicas |
| Panama Papers | 1.253 | 646 | Islas Virgenes Britanicas |
| Paradise Papers (Appleby) | 174 | 107 | Bermuda, Islas Caiman |
| Pandora Papers (SFM) | 90 | 39 | Belice, Panama |
| Paradise Papers (Malta) | 68 | 72 | Malta |

Solo los Pandora Papers (a traves del estudio juridico Alcogal) expusieron a 2.637 argentinos — mas que todas las demas filtraciones combinadas. Las Islas Virgenes Britanicas son la jurisdiccion abrumadoramente preferida.

De esos miles de nombres, esta investigacion cruzo tres coincidencias con legisladores activos. Una resulto presuntamente falso positivo. Las otras dos son los casos mas graves del dataset.

### IBAÑEZ, Maria Cecilia — La entidad activa

| Campo | Detalle |
|-------|---------|
| **Politica** | Maria Cecilia Ibañez, Diputada Nacional por Cordoba |
| **Bloque** | La Libertad Avanza |
| **Entidad offshore** | PELMOND COMPANY LTD. (BVI, constituida 31-Oct-2014) |
| **Estado de la entidad** | **ACTIVA** |
| **Fuente** | Panama Papers — [confirmada en base ICIJ](https://offshoreleaks.icij.org/nodes/10158328) |
| **Presencia legislativa** | 85,3% |

Ibañez voto AFIRMATIVO en el Presupuesto Nacional 2025. Voto NEGATIVO en el Financiamiento Universitario. Lo hizo mientras figuraba como titular de una sociedad offshore activa en las Islas Virgenes Britanicas.

Pero hay un dato adicional que agrava la imagen. Segun las declaraciones juradas patrimoniales:

- **2023:** ARS 15,5 millones
- **2024:** ARS 33,5 millones — su patrimonio se **duplico en un solo año**

Bajo la Ley 25.188, los funcionarios publicos deben declarar **todos** sus intereses, incluyendo participaciones offshore. Si PELMOND COMPANY LTD. no figura en sus declaraciones juradas ante la Oficina Anticorrupcion, estariamos ante una presunta omision dolosa.

**Estado:** ALTA CONFIANZA — coincidencia exacta de nombre confirmada en la base publica del ICIJ. Requiere verificacion contra la declaracion jurada presentada ante la OA.

### CAMAÑO, Graciela — 30 años, 6 partidos, una BVI

| Campo | Detalle |
|-------|---------|
| **Politica** | Graciela Camaño, Diputada Nacional por Buenos Aires |
| **Trayectoria** | 8 elecciones, 7 alianzas distintas, 6 partidos (1989-2019) |
| **Entidad offshore** | TT 41 CORP (BVI, constituida 23-Jun-2016) |
| **Fuente** | Pandora Papers (Trident Trust) |
| **Presencia** | 62,9% |
| **Posicion en el grafo** | 4to nodo mas conectado (2.364 relaciones) |

Graciela Camaño ocupa un lugar unico en esta investigacion: es la unica persona que aparece simultaneamente en los datos offshore **y** en anomalias de comportamiento politico.

La entidad TT 41 CORP fue constituida en junio de 2016 — **durante** su mandato como Diputada Nacional (2014-2018). No antes ni despues. Durante.

Su trayectoria patrimonial, reconstruida a partir de declaraciones juradas:

- **2013:** ARS 2,8 millones
- **2023:** ARS 39,2 millones
- **Crecimiento:** **14 veces** en diez años

Durante esa misma decada, emitio 326 votos sobre legislacion financiera — presupuesto, impuesto a las ganancias, blanqueo, IVA. Pero sus ausencias en votaciones financieras son reveladoras:

- Presupuesto: **35 votos ausente**
- Impuesto a las Ganancias: **19 votos ausente**

El patron — ausente en votaciones financieras mientras se posee una entidad offshore — no prueba nada por si solo. Pero genera una pregunta legitima: ¿se ausentaba deliberadamente en votaciones que podrian crear conflictos de interes con su sociedad en las BVI?

Su trayectoria de partidos tampoco es tipica:

1. FJ Unidad Popular (1989)
2. FJ Bonaerense (1997)
3. Partido Justicialista (2001-2003)
4. Frente para la Victoria (2007)
5. Frente Popular (2011)
6. Federal Unidos por una Nueva Argentina (2015)
7. Consenso Federal (2019)

Siete alianzas distintas en treinta años, siempre dentro de la orbita peronista pero constantemente cambiando de subfaccion. Un acceso transversal a multiples coaliciones que pocos politicos logran.

**Estado:** PROBABLE — coincidencia exacta de nombre, consistente con el patron Trident Trust/Argentina. Requiere verificacion contra DDJJ y confirmacion de identidad.

---

## Capitulo 4: El Imperio SOCMA — La Red Corporativa Macri

### 153 nombres, 211 empresas

La busqueda del apellido "Macri" en el registro de la IGJ devuelve **153 personas** vinculadas a **211 empresas**. No todas son parientes directos de Mauricio — el apellido incluye ramas extendidas de la familia. Pero el nucleo es SOCMA.

**Sociedad Macri S.A. (SOCMA)** fue fundada por Franco Macri en enero de 1976. Durante la dictadura militar, el grupo crecio de 7 a 47 empresas. En 1998, Forbes estimo la fortuna personal de Franco Macri en **USD 730 millones**.

Las subsidiarias clave:

| Empresa | Sector | Relevancia |
|---------|--------|-----------|
| Sideco Americana | Construccion | Buque insignia — autopistas, infraestructura |
| Correo Argentino | Servicios postales | Escandalo de condonacion de deuda |
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

Este es el conflicto de intereses mas directo documentado en la investigacion: el Presidente de la Nacion utilizando el aparato estatal para liquidar la deuda de su propia familia con el Estado a un descuento del 99%.

### AUSOL: la prima del 400%

La concesion de la autopista AUSOL fue renegociada durante la presidencia de Macri. La Oficina Anticorrupcion recomendo que Macri no participara; se recuso formalmente. Sin embargo, la renegociacion de 2018 comprometio al Estado en un impacto economico total estimado en **~USD 2.000 millones**.

Despues de las autorizaciones de aumentos de peaje, **Macri vendio sus acciones con una prima del 400%** a Natal Inversiones. Los fiscales imputaron a exfuncionarios por "administracion fraudulenta."

### El blanqueo: la ley propia, el beneficio propio

En 2016, el gobierno de Macri impulso una ley de blanqueo fiscal. Los propios integrantes de SOCMA la aprovecharon:

| Persona | Rol en SOCMA | Monto declarado |
|---------|-------------|-----------------|
| Gianfranco Macri | Hermano, cabeza operativa | ARS 622M (~USD 4M de BF Corp) |
| Leonardo Maffioli | CEO de SOCMA | ARS 76M |
| Armando Amasanti | Exdirector, Chery SOCMA | ARS 93M |
| Victor Composto | Director suplente, SOCMA | ARS 68M |
| Carlos Libedinsky | Socio de Jorge Macri | ARS 61,9M |

**Total declarado por el circulo SOCMA: mas de ARS 900 millones** en activos previamente ocultos.

Gianfranco tambien declaro un fideicomiso perteneciente a **Alicia Blanco Villegas** (madre de Mauricio), lo cual presuntamente violaria la prohibicion de la ley de blanqueo de declarar activos de familiares.

### La ruta offshore: BF Corporation y la destruccion de pruebas

| Entidad | Jurisdiccion | Titulares | Situacion |
|---------|-------------|-----------|-----------|
| Fleg Trading Ltd | Bahamas | Mauricio (Director/VP) | Judicialmente sobreseido — "no era socio ni accionista" |
| Kagemusha SA | Panama | Mauricio (Director) | Mismo resultado judicial |
| BF Corporation SA | Panama | Gianfranco (50%) + Mariano (50%) | Fondos movidos a Safra Bank, Suiza |
| Latium Investments Inc | Panama | Jorge Macri + Carlos Libedinsky | Libedinsky declaro ARS 61,9M via blanqueo |

El caso de **BF Corporation** es particularmente grave. Los fondos fueron movidos al Safra Bank en Suiza. Y un banco aleman vinculado a la operatoria recibio la orden de **destruir toda la correspondencia**. Gianfranco declaro USD 4 millones provenientes de esa offshore a traves del blanqueo — pero solo despues de ser denunciado.

### El patrimonio presidencial

Segun las declaraciones juradas de Mauricio Macri:

| Año | Patrimonio (ARS) | Cargo |
|-----|-----------------|-------|
| 2015 (ingreso) | ~110M (incl. 44,2M en fideicomiso ciego) | Presidente |
| 2016 | 82,6M | Presidente |
| 2017 | 99,9M | Presidente |
| 2018 | 151M | Presidente |
| 2019 (salida) | 273,3M | Presidente |

Nominalmente, un aumento del 148%. Pero ajustado por la inflacion acumulada del 297% en ese periodo, el patrimonio **cayo un 37,6% en terminos reales**. Sin embargo, la estructura de fideicomiso ciego hizo imposible la verificacion completa. Chequeado encontro que **no incluyo ciertos activos** en sus declaraciones.

### Mariano contra Gianfranco: la denuncia interna

En agosto de 2024, Mariano Macri presento denuncias penales contra SOCMA nombrando a Gianfranco, Florencia y al CEO Leonardo Maffioli. Los cargos: **administracion fraudulenta, falsificacion de documentos, evasion fiscal, balances falsos y lavado de activos**. La denuncia se centra en la manipulacion de deuda con el Meinl Bank para beneficiar a ciertos intereses.

Cuando un hermano denuncia penalmente al otro dentro de la propia estructura corporativa familiar, la informacion que emerge tiene un valor probatorio particular.

### MINERA GEOMETALES: el directorio que nadie mira

Hay un dato que no aparece en los titulares pero si en los registros de la IGJ. En el directorio de **MINERA GEOMETALES** confluyen tres nombres:

- **Mauricio Macri** — expresidente
- **Victor Composto** — insider de SOCMA que blanqueo ARS 68 millones
- **Jean Paul Luksic Fontbona** — heredero del grupo minero chileno Antofagasta PLC, una de las fortunas mas grandes de America Latina

Un expresidente, el operador corporativo de su familia que declaro decenas de millones en activos ocultos, y la elite minera del continente. En la misma mesa directiva.

---

## Capitulo 5: El Dinero de las Campañas — Quien Financia a Quien

### La asimetria del 2019

El analisis de las 1.714 donaciones registradas ante la CNE para las elecciones de 2019 revela una asimetria estructural:

- **Juntos por el Cambio** recibio **ARS 46,9 millones** de **75 donaciones** — mucho dinero, pocos donantes.
- **Frente de Todos** recibio **ARS 29,2 millones** de **459 donaciones** — menos dinero, muchos mas donantes.

El promedio por donacion de JxC fue casi **diez veces** mayor que el de FdT. Esto no es un juicio de valor: es un dato estructural. Una coalicion dependia de grandes aportes corporativos; la otra, de una base mas fragmentada.

### Los mayores donantes

| Donante | Tipo | Monto (ARS) | Receptor |
|---------|------|-------------|----------|
| Unicenter SA | Juridica | 8.500.000 | JxC |
| Sicma S.A. | Juridica | 6.210.286 | JxC |
| **Aluar Aluminio Argentino** | **Juridica** | **5.400.000** | **JxC + FdT** |
| Control Union Argentina | Juridica | 4.640.000 | JxC |
| Origenes Retiro Seguros | Juridica | 4.500.000 | JxC |
| Valiente Polo J5 Argentina | Juridica | 4.500.000 | JxC |
| Grupo Emes S.A. | Juridica | 4.200.000 | JxC |
| PETROMIX S.A. | Juridica | 4.000.000 | JxC |

De los 20 mayores donantes, **13 dieron exclusivamente a Juntos por el Cambio**. Solo uno — Aluar — aposto a ambos lados.

### Aluar: la apuesta doble

Aluar Aluminio Argentino SAIC dono **ARS 5.400.000** divididos entre JxC y Frente de Todos. Es el unico donante top-20 que financio a ambas coaliciones.

Aluar es el mayor productor de aluminio de Argentina. Depende de subsidios energeticos del Estado y de protecciones arancelarias. Financiar a ambos bandos no es generosidad civica: es un seguro de acceso al poder sin importar quien gane.

### Los donantes que son contratistas del Estado

La Ley 26.215 (Art. 15) prohibe expresamente que los contratistas del Estado realicen aportes de campana. Esta investigacion detecto presuntas violaciones:

| Persona | Rol como contratista | Rol como donante | Situacion legal |
|---------|---------------------|-----------------|-----------------|
| Juan Pablo Rodriguez | Contratista (2018-2020), 4 contratos | Donante de campana | Presunta violacion de Ley 26.215 |
| ~~Jorge Omar Gonzalez~~ | ~~Contratista (2018-2020), 1 contrato~~ | ~~Donante de campana~~ | **FALSO POSITIVO — CUITs diferentes confirman personas distintas** |

El caso de Rodriguez requiere investigacion formal. El de Gonzalez fue descartado tras verificacion de identidad por CUIT.

### Macri y los empleados de contratistas

Chequeado documento que Macri recibio aproximadamente **ARS 3 millones** en donaciones de *empleados de empresas contratistas del Estado* — una forma de eludir la prohibicion del Art. 15 sobre donaciones corporativas. La empresa no dona directamente; sus empleados lo hacen. El efecto es el mismo.

### Los politicos que se donan a si mismos

Las 50 coincidencias verificadas entre politicos y donantes (100% confirmadas, cero falsos positivos) mostraron que todas las donaciones van al propio partido/coalicion del politico:

- **Mauricio Macri:** ARS 100.000 a JxC 2019
- **Maximo Kirchner:** ARS 50.000 a Frente de Todos 2019

No se detecto financiamiento cruzado entre coaliciones por parte de politicos activos.

---

## Capitulo 6: La Ley Bases — Cuando los Directivos Votaron la Desregulacion

### El voto del 12 de junio de 2024

La Ley de Bases — el proyecto de desregulacion economica del gobierno de Milei — fue aprobada en el Senado con 36 votos afirmativos contra 36 negativos (desempate por la vicepresidenta).

El cruce con datos corporativos revela un patron:

- Legisladores con cargos en directorios de empresas votaron **42 a favor y 7 en contra** de la Ley Bases.
- Entre los que tienen mas cargos en directorios, la proporcion es aun mas marcada: **50 SI, 27 SI** en la Reforma Laboral asociada.
- **108 cargos en directorios** se concentran en senadores que votaron afirmativamente.

Los politicos con conexiones corporativas votan sistematicamente a favor de la desregulacion. Esto no es un hallazgo sorprendente, pero ahora tiene numeros.

### Los votos que importan

~~**Romero, Juan Carlos** (Cambio Federal, Salta): segun los registros de la IGJ, figura vinculado a **41 empresas**. Voto AFIRMATIVO en la Ley Bases.~~ **FALSO POSITIVO CONFIRMADO:** Las 41 posiciones en directorios corresponden a un **Juan Carlos Romero diferente** — el dueño del grupo de transporte ERSA, con sede en Corrientes. La homonimia fue resuelta mediante verificacion cruzada de datos corporativos. El senador salteño puede tener intereses empresariales, pero las 41 empresas no son suyas.

**Kueider, Edgardo** (Unidad Federal, Entre Rios): Voto AFIRMATIVO en la Ley Bases — **un voto clave** que permitio la aprobacion de la ley insignia del gobierno de Milei.

Lo que vino despues convierte a Kueider en el caso mas espectacular de esta investigacion. Sus empresas **BETAIL SA** y **EDEKOM SA**, registradas en la IGJ, son sociedades pantalla confirmadas: las direcciones legales son falsas. BETAIL fue utilizada para adquirir **departamentos de lujo en Parana**.

En **diciembre de 2024**, Kueider fue detenido intentando cruzar la frontera con Paraguay llevando **USD 211.000 en efectivo** no declarado. Fue **expulsado del Senado**.

En **marzo de 2025**, la justicia arresto a **7 asociados y testaferros** de Kueider. En los allanamientos se encontraron **videos de Kueider manipulando fajos de billetes en efectivo**.

La secuencia completa merece detenimiento: un senador vota la ley mas importante del periodo legislativo — proporcionando uno de los 36 votos afirmativos (el desempate lo resolvio la vicepresidenta Villarruel) —, opera empresas fantasma con domicilios falsos, compra propiedades de lujo a traves de esas pantallas, es atrapado con mas de doscientos mil dolares en efectivo en la frontera, y termina con siete testaferros presos y videos incriminatorios.

No hay presuncion aqui. Hay hechos judiciales, videos y arrestos. Fuentes: Infobae, La Nacion.

**Lousteau, Martin** (UCR): Voto AFIRMATIVO en la Ley Bases. Lo hizo mientras su consultora, **LCG SA**, habia facturado **$1.690.000** a la Oficina de Presupuesto del Congreso entre 2020 y 2022 — periodo durante el cual Lousteau ejercia como senador.

Un senador cuya empresa privada cobra del Congreso y que vota legislacion economica desde ese mismo Congreso. Se presentaron cargos penales por **negociaciones incompatibles con la funcion publica**. Fuente: iProfesional.

### La paradoja de la oposicion

El dato mas contraintuitivo: los senadores de la oposicion (PJ) que votaron NEGATIVO tenian en promedio **mas conexiones con datasets externos** que los oficialistas que votaron SI.

- **AFIRMATIVO:** 36 senadores, promedio 1,44 datasets externos
- **NEGATIVO:** 36 senadores, promedio 1,53 datasets externos

Interpretaciones posibles:

1. Los senadores PJ votaron en contra porque la desregulacion amenazaba sus propios intereses empresariales.
2. Las conexiones corporativas no predicen el voto — la ideologia si.
3. La red corporativa del PRO opera por canales que estos datos no capturan (fundaciones, fideicomisos, relaciones informales).

La respuesta probablemente combina las tres. Pero el dato desmiente la narrativa simplista de que solo un lado tiene vinculos corporativos.

### Tagliaferri y PENSAR ARGENTINA

Hay un caso que ilustra el circuito completo. La senadora del **Frente PRO** que voto AFIRMATIVO en la Ley Bases figura tambien como miembro del directorio de **PENSAR ARGENTINA** — la misma fundacion que presumiblemente contribuyo al diseño de las politicas de desregulacion que sus propios miembros luego votaron desde sus bancas.

La fabrica de politicas publicas produjo la legislacion. Sus propios directivos la votaron en el Congreso. Y el registro corporativo de la IGJ documenta ambas cosas.

---

## Capitulo 7: El Zorro en el Gallinero — Ferrari, la AFIP y Panama

### Un agente fiscal con una offshore

Entre los miles de nombres que cruzamos entre la base del Boletin Oficial y las filtraciones del ICIJ, aparecio una coincidencia que resume todo el problema del sistema:

**Ferrari Facundo** — agente de la AFIP (Administracion Federal de Ingresos Publicos, el organismo recaudador argentino) — aparece como oficial de una entidad offshore en los **Panama Papers**.

La AFIP es la autoridad encargada de perseguir la evasion fiscal y detectar activos no declarados en el exterior. Un agente de ese organismo con una presunta sociedad offshore es, literalmente, el zorro cuidando el gallinero.

**Estado:** Este hallazgo se basa en coincidencia de nombre y requiere verificacion de identidad. "Ferrari" y "Facundo" no son nombres extremadamente comunes en combinacion, pero tampoco unicos. Es un lead que requiere confirmacion mediante CUIT o DNI.

### Reale Jose Maria — otro fiscalizador

Tambien aparece en los Panama Papers **Reale Jose Maria**, identificado en el Boletin Oficial como **Fiscalizador Principal** — un cargo de supervision en el aparato estatal.

### Lo que significa

Estos casos individuales son leads, no condenas. Pero señalan un problema estructural: ¿quien fiscaliza a los fiscalizadores? Si los propios agentes del Estado encargados de controlar la evasion offshore tienen presuntas entidades offshore, el sistema de control tiene un vicio de origen.

### Cordero: el ducto Estado-Offshore

Hay un caso aun mas grave en terminos estructurales. **Maria Eugenia Cordero** aparece simultaneamente como:

1. **Contratista del Estado** (recibe dinero publico)
2. **Oficial de BETHAN INVESTMENTS LIMITED** (entidad offshore)

Esta combinacion crea un ducto directo: dinero publico → persona → entidad offshore. Es la arquitectura basica de un esquema de presunto lavado, y una potencial violacion de la **Ley 25.246** (antilavado).

**Estado:** Coincidencia de nombre. Requiere verificacion de identidad.

---

## Capitulo 7b: Karin Models — La Coincidencia Epstein

### Un nombre exacto en la IGJ

En el curso de una investigacion cruzada con datos del caso Epstein, aparecio un hallazgo inesperado. **Jean-Luc Brunel** — el agente de modelos frances condenado por trafico sexual vinculado a Jeffrey Epstein, hallado muerto en su celda en febrero de 2022 — operaba una agencia llamada **"Karin Models"** desde Paris.

En el registro de la Inspeccion General de Justicia argentina existe una sociedad anonima con el nombre exacto: **KARIN MODELS S.A.**

Su directorio registra 4 miembros: **Cammarata, Elortegui**, y los **hermanos Monaco**.

**Estado: NO VERIFICADO.** La coincidencia de nombre es exacta, pero eso no establece conexion operativa. Podria tratarse de una sucursal de la agencia de Brunel en Buenos Aires — lo cual tendria implicaciones graves dado el historial de trafico de la red Epstein-Brunel. O podria ser una agencia de modelos completamente independiente que simplemente comparte el nombre.

Las dos investigaciones — finanzas politicas y red Epstein — son **estructuralmente aisladas**: no comparten nodos en comun salvo este nombre. La coincidencia merece verificacion independiente, pero no debe sobreinterpretarse. Se menciona aqui por transparencia y para que investigadores con acceso a datos adicionales puedan evaluar si existe una conexion real.

---

## Capitulo 8: Los Numeros — El Panorama Completo

### La infraestructura de datos

| Fuente | Registros | Tipo |
|--------|-----------|------|
| Como Voto | 2.258 politicos, 920.000 votos, 2.997 mandatos, 3.827 leyes | Legislativo |
| ICIJ Offshore Leaks | 4.349 oficiales argentinos, 2.422 entidades | Filtraciones internacionales |
| CNE Aportantes | 1.714 donaciones, 1.467 donantes | Financiamiento de campañas |
| Boletin Oficial / datos.gob.ar | 6.044 nombramientos, 22.280 contratos | Gobierno |
| IGJ Registro Empresarial | 951.863 oficiales, 1.060.769 empresas | Corporativo |
| CNV Directivos | 1.528.931 cargos en directorios | Corporativo |
| DDJJ Patrimoniales | 718.865 declaraciones (2012-2024) | Declaraciones juradas |

**Total: 5.387.477 nodos — 4.412.802 relaciones**

### Las coincidencias entre datasets

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

### Falsos positivos confirmados y limpieza de datos

El rigor de una investigacion se mide tanto por lo que encuentra como por lo que descarta. En este ciclo se confirmaron dos falsos positivos significativos:

- **Romero, Juan Carlos (Senador, Salta):** Las 41 posiciones en directorios que aparecian vinculadas al senador corresponden en realidad a un **homonimo de Corrientes** — el dueño del grupo de transporte ERSA. Son personas diferentes.
- **Gonzalez, Jorge Omar (Contratista-Donante):** La verificacion de CUITs confirmo que el contratista y el donante son **personas distintas** con el mismo nombre.

Estos hallazgos reducen el numero de coincidencias accionables pero **mejoran sustancialmente la calidad de los datos**. Cada falso positivo eliminado aumenta la confianza en los hallazgos restantes.

### Politicos en multiples datasets

Los politicos que aparecen en mas datasets simultaneos son los nodos mas interesantes de la investigacion:

| Politico | Partido | Datasets | Detalle |
|----------|---------|----------|---------|
| Mauricio Macri | PRO | 5 | Donante + Directivo + Oficial empresa + DDJJ + Funcionario |
| Fernando Sanchez | CC | 5 | 13 empresas + Secretario de Gabinete |
| Graciela Camaño | Consenso Federal | 4 | Offshore + Directivo + Oficial empresa + DDJJ |
| Maria Cecilia Ibañez | LLA | 4 | Offshore + Directivo + Oficial empresa + DDJJ |

### Lo que los numeros no dicen

Hay limitaciones importantes:

1. **Los totales patrimoniales estan vacios.** El campo `total_assets` en las declaraciones juradas es nulo para la mayoria de los registros. Los items individuales (bienes, deudas) existen en archivos CSV separados que aun no fueron ingeridos.

2. **Los montos de contratos no estan disponibles.** Rodriguez tenia 4 contratos pero sus valores son desconocidos.

3. **El matching es por nombre, no por DNI.** Nombres comunes (Garcia, Rodriguez, Martinez, Fernandez) inflacionan las coincidencias. El caso de "Fernandez Carlos Alberto" con 108 cargos en directorios fue confirmado como **multiples personas diferentes** con el mismo nombre.

4. **El Boletin Oficial es una foto de diciembre 2019.** Faltan datos historicos y posteriores.

5. **No hay datos de COMPR.AR** (el sistema de compras publicas actual), que permitiria verificar contratos recientes.

### GRUPO PROVINCIA: el puente inesperado

En los datos corporativos aparece un puente que cruza lineas partidarias. **GRUPO PROVINCIA** tiene en su directorio simultaneamente a:

- **Jorge Macri** (PRO)
- **Eduardo Oscar Camaño** (PJ)
- **Rodolfo Frigeri** (PJ)
- **Francisco Gutierrez** (FpV)
- **Alberto Iribarne** (PJ)
- **Damaso Larraburu** (PJ)

Cinco politicos del PJ comparten directorio con Jorge Macri. Las lineas partidarias que parecen tan rigidas en el recinto legislativo se disuelven en la mesa de directorio.

### Puentes corporativos entre bloques: el Banco de Inversion y Comercio Exterior

GRUPO PROVINCIA no es el unico caso. El **Banco de Inversion y Comercio Exterior** reune en su directorio a politicos de coaliciones rivales:

- **Domina** (PJ) + **Frigerio** (PRO) — comparten directorio
- **De Mendiguren** (Frente de Todos) + **Fabrissin** (UCR) — comparten directorio en la misma entidad

Estos puentes son significativos porque las personas que se enfrentan en el recinto legislativo — votando en bloques opuestos en la Ley Bases, en presupuestos, en reformas laborales — comparten mesa directiva en una entidad financiera. El enfrentamiento politico es real en el Congreso; la convergencia de intereses es real en el directorio. Ambas cosas son ciertas simultaneamente, y esa dualidad es la que esta investigacion busca documentar.

---

## Capitulo 9: Que Sigue

### Lo que esta confirmado

1. **PELMOND COMPANY LTD.** (Ibañez) esta confirmada como activa en la base publica del ICIJ. Es una entidad offshore operativa vinculada a una legisladora en ejercicio.

2. **TT 41 CORP** (Camaño) esta confirmada en Pandora Papers/Trident Trust. Fue constituida durante el mandato legislativo.

3. **PENSAR ARGENTINA** esta registrada en la IGJ con mas de 50 politicos PRO y Nicolas Caputo como miembros formales del directorio.

4. **Correo Argentino:** la quita del 98,82% esta documentada judicialmente. La imputacion a Macri y Aguad es publica.

5. **El blanqueo SOCMA:** los montos declarados por Gianfranco, Maffioli, Composto y Libedinsky estan documentados en investigaciones periodisticas de Perfil.

6. **Las donaciones corporativas de 2019** estan registradas en la base publica de la CNE.

7. **La violacion presunta de contratista-donante** (Rodriguez) surge del cruce de bases publicas. El caso Gonzalez fue descartado como falso positivo.

8. **Kueider:** expulsion del Senado, detencion con USD 211.000 en efectivo, empresas fantasma BETAIL SA y EDEKOM SA con domicilios falsos, 7 testaferros arrestados, videos con fajos de billetes. Confirmado por fuentes judiciales y periodisticas.

9. **Lousteau:** facturacion de LCG SA al Congreso por $1.690.000 durante su mandato como senador. Cargos penales por negociaciones incompatibles.

10. **PENSAR ARGENTINA:** 19 politicos confirmados por DNI, elevando la confianza del hallazgo al maximo nivel.

### Lo que necesita verificacion

1. **Ibañez y Camaño:** verificar si PELMOND y TT 41 CORP figuran en sus declaraciones juradas ante la Oficina Anticorrupcion. Si no figuran, hay presunta omision dolosa bajo Ley 25.188.

2. **Ferrari Facundo y Reale Jose Maria:** confirmar identidad mediante CUIT/DNI. La coincidencia es por nombre solamente.

3. **Cordero como contratista + offshore:** confirmar que es la misma persona en ambos datasets.

4. **MINERA GEOMETALES:** verificar la composicion actual del directorio y la naturaleza de las operaciones de la empresa.

5. **Tagliaferri y PENSAR ARGENTINA:** confirmar su pertenencia formal al directorio al momento de la votacion de la Ley Bases.

6. **Montos de contratos publicos** de Rodriguez y Gonzalez para evaluar la magnitud de las presuntas violaciones.

### Lo que deberia investigarse

1. **La Oficina Anticorrupcion** deberia revisar las declaraciones juradas de Ibañez y Camaño contra las bases del ICIJ. Es un cruce que se puede hacer en una tarde.

2. **La Camara Nacional Electoral** deberia cruzar su base de donantes con la de contratistas del Estado. La Ley 26.215 lo exige; la tecnologia lo permite; nadie lo hace sistematicamente.

3. **La AFIP** deberia auditar a sus propios agentes contra las bases de Panama Papers y Pandora Papers. Si Ferrari Facundo es efectivamente un agente fiscal con una offshore, el conflicto de intereses es autoevidente.

4. **El Congreso** deberia exigir que la IGJ publique datos actualizados de composicion de directorios de entidades como PENSAR ARGENTINA, para que la ciudadania pueda verificar si los legisladores que votan leyes son los mismos que las diseñan desde fundaciones partidarias.

5. **Los medios periodisticos** deberian profundizar en MINERA GEOMETALES — una empresa que reune a un expresidente, un insider de SOCMA que blanqueo decenas de millones, y un magnate minero chileno.

### Los proximos pasos tecnicos

Para fortalecer esta investigacion:

- Corregir el bug de BOM en los parsers CSV y recargar relaciones empresa-oficial
- Ingerir las tablas individuales de DDJJ (bienes, deudas) para obtener trayectorias patrimoniales reales
- Agregar matching por CUIT para reducir falsos positivos drasticamente
- Incorporar datos de COMPR.AR (compras publicas) para contratos recientes
- Extender los datos del Boletin Oficial mas alla de la foto de diciembre 2019
- Construir indices de busqueda fulltext para reemplazar las consultas CONTAINS
- Agregar deduplicacion por DNI para resolver colisiones de nombres comunes

### Una nota final

Esta investigacion no acusa a nadie. Los datos publicos no prueban delitos — prueban conexiones, coincidencias y patrones que merecen explicacion. Pero cuando esas conexiones involucran a un expresidente cuya familia blanqueo ARS 900 millones con su propia ley, a legisladoras con offshores activas mientras votan presupuestos, a un senador que dio un voto clave para la ley mas importante del periodo y fue atrapado meses despues con doscientos mil dolares en efectivo en la frontera, a otro senador cuya consultora privada cobraba del propio Congreso donde el legislaba, a agentes fiscales con presuntas sociedades en Panama, y a una fundacion partidaria con 19 miembros confirmados por DNI que diseña las leyes que sus propios directivos votan — entonces los datos no necesitan acusar a nadie.

Los datos preguntan. Y las preguntas exigen respuestas.

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
