Contexto de Desarrollo: Próxima Generación de Onboarding App (Trillium)
Este documento centraliza el contexto operativo, los requisitos técnicos y las expectativas del equipo para el desarrollo de la aplicación de Onboarding en React. Está diseñado para ser utilizado como contexto en herramientas de IA (Cursor/Claude) para acelerar el desarrollo.

1. Visión del Proyecto
   Transformar el proceso de onboarding de Trillium de una serie de tareas manuales a una experiencia fluida, automatizada y centrada en el usuario, utilizando MYAI como motor de inteligencia y el Project Canvas como fuente de verdad.
   Pilares Técnicos:
   Arquitectura: React App Externa (Velocidad de iteración).
   Datos: Integración con Zoho, Deel, Gusto y SharePoint.
   Seguridad: Arquitectura basada en "Intención" y URLs firmadas.

2. Historias de Usuario (Backlog de Desarrollo)
   Portal del Nuevo Empleado (Experience)

\*OB-01 Visualización de Progreso
Descripción: Como nuevo empleado, quiero ver una barra de progreso visual de mi onboarding, para saber cuánto me falta para estar 100% operativo.
AC:
-Progreso dividido en 4 fases (Discovery, Setup, Access, Integration).
-Visualización de tareas completadas vs pendientes.

\*OB-02 Entrevista Conversacional (Maya)
Descripción: Como nuevo empleado, quiero completar mi perfil y recolección de datos mediante una charla con la IA (Maya), para evitar formularios estáticos.
AC:
-Uso de Adaptive Cards para capturar datos específicos (ej. ID de empleado).
-Validación inmediata de formatos (correo, teléfono) durante la charla.

\*OB-03 Historial de Decisiones (Transparencia)
Descripción: Como nuevo empleado, quiero un "Botón de Historia" que me explique qué accesos se crearon y por qué, para sentir control sobre el proceso automatizado.
AC:
-Registro de eventos (logs) en lenguaje natural (no técnico).
-Acceso directo desde el perfil del usuario en la app.

\*OB-04 Dashboard de Seguimiento para Managers
Descripción: Como Project Manager (Deborah/Whitney), quiero un tablero centralizado con el estatus de todos los nuevos ingresos, para identificar bloqueos técnicos rápidamente.
AC:
-Filtros dinámicos por proyecto y fase actual del empleado.
-Alertas visuales para tareas que han superado el tiempo estimado de resolución.

\*OB-05 Auto-Aprovisionamiento de Herramientas
Descripción: Como PM, quiero autorizar accesos a herramientas (Jira, GitLab, Slack) con un solo clic, para eliminar la espera de tickets manuales.
AC:
-Botón de "Aprobar Todo" o selección individual de herramientas según el rol.
-Confirmación visual de éxito tras la integración con las APIs de las herramientas.

\*OB-06 Monitor de Estatus del Ecosistema
Descripción: Como usuario, quiero ver el estado de salud de los servicios (Gusto, Zoho, MYAI), para no reportar errores si el problema es una caída externa.
AC:
-Feed en tiempo real con indicadores de color (Verde/Amarillo/Rojo).
-Historial de mantenimientos programados visibles.

\*OB-07 Clasificación Inteligente de Feedback
Descripción: Como equipo de desarrollo (Jacob/Mark), quiero que el feedback de los usuarios se clasifique automáticamente en "Bug" o "Feature Request", para priorizar el backlog.
AC:
-Clasificación automática mediante LLM basada en el texto del usuario.
-Notificación automática al canal de Teams correspondiente según la categoría.

\*OB-08 Integración con Project Canvas (Single Source of Truth)
Descripción: Como arquitecto del sistema (Parvin), quiero que la app lea y escriba directamente en el Project Canvas, para que todos los sistemas de Trillium estén sincronizados.
AC:
-Sincronización bidireccional de variables globales (Zoho ID, Folder ID).
-Prevención de duplicidad de datos entre la App y el Canvas.

3. Especificaciones Técnicas para Cursor
   Estructura de Datos (Project Canvas)
   El Project Canvas debe actuar como el "Glue Object" que conecta:
   Zoho Project ID (System of Record).
   Contract ID (Financials).
   SharePoint Folder (Documents).
   Restricciones de Seguridad (Mark/Jacob)
   Contención de Bucles: El sistema debe tener un "Circuit Breaker" para evitar loops infinitos en el procesamiento de tareas.
   Zero-Chat Monitoring: No se deben monitorear chats privados. Toda interacción debe ser vía el portal o mención directa a Maya.
   Integraciones Requeridas
   HRIS: Deel/Gusto (Sync de perfiles).
   Collaboration: Microsoft Teams API (Notificaciones proactivas).
   File Sharing: URLs firmadas de 1 hora para documentos sensibles.
