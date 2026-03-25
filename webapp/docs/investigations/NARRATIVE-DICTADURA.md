# Caso Dictadura — Narrativa de Investigación

> Generado automáticamente el 2026-03-24 a partir del grafo de conocimiento.
> Fuente: 12120 nodos, 29473 aristas en caso-dictadura.

---

## Resumen del Grafo

| Métrica | Valor |
|---------|-------|
| Nodos totales | 12,120 |
| Aristas totales | 29,473 |
| Víctimas | 0 |
| Represores | 0 |
| CCDs | 774 |
| Causas judiciales | 10 |
| Unidades militares | 42 |
| Organizaciones | 36 |
| Documentos | 100 |

### Distribución por Tier de Confianza

- **bronze**: 10,841 nodos
- **gold**: 159 nodos
- **silver**: 1,120 nodos

### Distribución por Ola de Ingestión

- Wave 0: 159 nodos
- Wave 1: 10,388 nodos
- Wave 2: 752 nodos
- Wave 3: 28 nodos
- Wave 4: 36 nodos
- Wave 5: 632 nodos
- Wave 6: 50 nodos
- Wave 7: 30 nodos
- Wave 9: 28 nodos
- Wave 11: 6 nodos
- Wave 12: 11 nodos

---

# Esquemas de Investigación: La Dictadura Cívico-Militar Argentina (1976-1983)

A continuación, se presentan los esquemas detallados para los siete capítulos de la investigación. Estos esquemas se basan estrictamente en la topología y los datos del grafo de conocimiento proporcionado, cruzando nodos, aristas y métricas de confianza para construir una narrativa analítica robusta.

---

## Capítulo 1: El Aparato
### Subtítulo: La arquitectura de la represión y la densidad de los centros clandestinos

Este capítulo analiza la estructura organizativa que permitió la implementación del terrorismo de Estado. Se examina la jerarquía militar, la distribución geográfica de los sitios de detención y la interconexión entre unidades.

**Secciones:**

1.  **Topología de las Unidades Militares:**
    *   **Temas:** Análisis de las 42 unidades militares registradas en el grafo.
    *   **Datos del Grafo:** 42 nodos de tipo `DictaduraUnidadMilitar`. Relación `COMANDO` (7 aristas) y `OPERADO_POR` (19 aristas).
    *   **Pregunta de investigación:** ¿Qué patrones de jerarquía se observan entre las unidades operativas y el comando central?
    *   **Fuentes:** Nodos `DictaduraUnidadMilitar` y aristas de jerarquía.

2.  **Red de Centros Clandestinos de Detención (CCD):**
    *   **Temas:** Mapeo de los 774 CCDs identificados.
    *   **Datos del Grafo:** 774 nodos `DictaduraCCD`. Relación `SECUESTRADO_EN` (7,646 aristas) y `DETENIDO_EN` (2,253 aristas).
    *   **Pregunta de investigación:** ¿Cómo se correlaciona la densidad de CCDs con la cantidad de víctimas vinculadas por región?
    *   **Fuentes:** Nodos `DictaduraCCD` y estadísticas de víctimas por sitio.

3.  **Distribución Geográfica de la Represión:**
    *   **Temas:** Análisis de los 1,067 lugares vinculados a la dictadura.
    *   **Datos del Grafo:** 1,067 nodos `DictaduraLugar`. Relación `UBICADO_EN` (771 aristas).
    *   **Pregunta de investigación:** ¿Qué provincias concentran la mayor cantidad de nodos de lugares de detención y secuestro?
    *   **Fuentes:** Nodos `DictaduraLugar` y `SECUESTRADO_EN`.

4.  **Cadena de Mando y Responsabilidad:**
    *   **Temas:** Identificación de los responsables directos y la estructura de mando.
    *   **Datos del Grafo:** 9,743 nodos `DictaduraPersona`. Relación `HIJO_DE` (12 aristas) y `ACUSADO_EN` (31 aristas).
    *   **Pregunta de investigación:** ¿Qué porcentaje de los nodos de personas tiene una relación de acusación directa en el grafo?
    *   **Fuentes:** Nodos `DictaduraPersona` y aristas `ACUSADO_EN`.

5.  **Confianza en los Datos del Aparato:**
    *   **Temas:** Evaluación de la veracidad de los nodos militares.
    *   **Datos del Grafo:** 10,841 nodos en nivel *bronze*, 1,120 en *silver*, 159 en *gold*.
    *   **Pregunta de investigación:** ¿Cómo afecta la baja proporción de datos *gold* (159/12,120 nodos) a la certeza histórica de la estructura militar?
    *   **Fuentes:** Métricas de confianza del grafo.

---

## Capítulo 2: Las Víctimas
### Subtítulo: Demografía, nacionalidad y perfiles de las desapariciones

Este capítulo se centra en el perfil humano de las víctimas. Se contrasta la cantidad total de personas en el grafo con la distribución específica de víctimas por nacionalidad y su vínculo con los CCDs.

**Secciones:**

1.  **Volumen y Categorización de Personas:**
    *   **Temas:** Diferenciación entre víctimas y otros actores en los 9,743 nodos `DictaduraPersona`.
    *   **Datos del Grafo:** 8,759 víctimas de nacionalidad argentina vs. 9743 nodos totales.
    *   **Pregunta de investigación:** ¿Qué proporción de los nodos `DictaduraPersona` corresponde a víctimas documentadas versus otros roles?
    *   **Fuentes:** Nodos `DictaduraPersona` y lista de víctimas por nacionalidad.

2.  **Distribución Nacional:**
    *   **
