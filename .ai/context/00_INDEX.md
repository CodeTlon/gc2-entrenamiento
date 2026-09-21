# Índice — `.ai/context/`

Capa profunda de contexto para agentes de IA sobre GC² Entrenamiento. El punto de entrada corto es `AGENTS.md` (raíz) — si llegaste acá sin pasar por ahí, leelo primero.

Regla de oro: **leé sólo el archivo que corresponde a tu tarea**, no todo el directorio.

## Qué leer según la tarea

| Tarea | Archivo(s) |
|---|---|
| Orientarte por primera vez en el proyecto | `PROJECT.md` |
| Tocar auth, RLS, server actions, proxy, deploy o env vars | `ARCHITECTURE.md` + `KNOWN_ISSUES.md` |
| Entender el modelo de datos, reglas de negocio, límites de upload | `DOMAIN.md` |
| Escribir código nuevo siguiendo el estilo del repo (componentes, actions, estilos) | `CONVENTIONS.md` |
| Entender por qué algo se implementó de una forma particular | `DECISIONS.md` |
| Saber qué está completo, en curso, o pendiente ahora mismo | `CURRENT_STATE.md` |
| Evaluar riesgo antes de una tarea sensible (prod, secrets, deps) | `KNOWN_ISSUES.md` |
| Ver qué quedó sin resolver / requiere decisión humana | `OPEN_QUESTIONS.md` |

## Cómo se construyó esta capa

Generada el 2026-09-18 vía auditoría de evidencia real (código, config, git, `npm audit`, migraciones SQL) — no a partir de lo que la documentación previa afirmaba. Cada hallazgo en estos archivos está etiquetado FACT (con evidencia verificable), ASSUMPTION, UNKNOWN o DECISION. No se mutó ningún dato de producción para generarla (sólo lecturas locales + `npm audit`, que no escribe nada).

## Veredicto RAG / subagente de mantenimiento (Fase 3)

- **RAG: no aplica hoy.** No hay un corpus externo que no entre en contexto económicamente y cambie seguido — todo el contexto relevante (código, ~10 archivos de esta capa, changelog) entra cómodo en una ventana de contexto normal y cambia a la cadencia de las sesiones de `/cambio`, no continuamente.
- **Subagente de mantenimiento dedicado: no aplica hoy.** Es un proyecto único de alcance acotado; el mantenimiento ya está cubierto por las skills propias del repo (`/cambio` abre rama, `/cerrar` mergea/pushea/tagea) más la memoria de `.claude/CLAUDE.md`. No hay dolor real de sincronizar contexto entre múltiples proyectos que justifique un subagente aparte.
