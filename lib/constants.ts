// IMPORTANT: Replace EMAIL_1_HERE and EMAIL_2_HERE with the two real emails
// before running. Only these two addresses can request a magic link.
export const ALLOWED_EMAILS = ['emmi.a.rivero@gmail.com', 'santivillarley1010@gmail.com']

export const COUPLE_ID = 'cerca-main'

// Monthly anniversary — fixed on the 11th of every month.
export const ANNIVERSARY_DAY = 11
export const ANNIVERSARY_TITLE = 'Aniversario del primer beso'

// Reunion date — update as needed.
export const REUNION_DATE = new Date('2026-06-27T02:00:00')

// Human-readable label shown under the countdown.
export const REUNION_LABEL = 'Nos vemos el 27 de junio · 2:00 AM'

// Daily questions unlock at this hour in APP_TIMEZONE (matches the push cron).
export const QUESTION_UNLOCK_HOUR = 10
export const APP_TIMEZONE = 'America/Havana'

// Fallback start date for the daily question unlock, used when there are no
// journal entries yet to anchor "day 1".
export const APP_START_DATE = new Date('2026-06-01T00:00:00')

// Category 1 — uses question_index 0–999 in the DB
export const QUESTIONS_CONOCERNOS: string[] = [
  '¿Cuál es tu recuerdo favorito de nosotros?',
  '¿Qué es lo primero que quieres hacer cuando nos veamos?',
  '¿Qué canción te recuerda a mí?',
  '¿En qué momento supiste que algo especial pasaba entre nosotros?',
  '¿Cuál es la cosa más tonta que te ha hecho reír pensando en mí?',
  '¿Qué lugar del mundo quieres visitar conmigo?',
  '¿Cómo imaginas nuestro día perfecto juntos?',
  '¿Qué es lo que más extrañas de mí ahora mismo?',
  '¿Qué película deberíamos ver juntos la próxima vez?',
  '¿Cuál es tu hora favorita del día para hablar conmigo?',
  '¿Qué objeto tuyo me regalarías si pudieras?',
  '¿Qué aprendiste de mí que no sabías antes?',
  '¿Cuál sería nuestra canción si pudieras elegir una ahora?',
  '¿Qué te gustaría que yo supiera sobre cómo te extraño?',
  '¿Cuál es la parte más difícil de la distancia para ti?',
  '¿Qué cosa pequeña del día a día quisieras compartir conmigo?',
  '¿Qué es lo que más te gusta de hablar conmigo?',
  '¿Cuándo fue la última vez que pensaste en mí sin razón?',
  '¿Qué sueño tienes que quieres que sea nuestro?',
  '¿Si pudieras teletransportarte ahora, a dónde irías conmigo?',
  '¿Qué comida quieres que cocinemos juntos?',
  '¿Qué ritual quieres que tengamos cuando estemos juntos?',
  '¿Hay algo que me quieras decir y no hayas dicho aún?',
  '¿Qué parte de tu día siempre quieres contarme?',
  '¿Cómo sabes que estás pensando demasiado en mí?',
  '¿Qué te hace sentir cerca aunque estemos lejos?',
  '¿Qué canción pusiste hoy que me hubieras querido mandar?',
  '¿En qué te inspiro?',
  '¿Qué parte de mí extrañas físicamente más?',
  '¿Qué te imaginas que hacemos el primer día que nos veamos?',
]

// Category 2 — uses question_index 1000–1999 in the DB
export const QUESTIONS_CRECER: string[] = [
  '¿Cuál es el mayor miedo que quieres superar y cómo puedo ayudarte?',
  '¿Qué hábito quieres que cultivemos juntos?',
  '¿Cómo imaginas nuestra vida en 5 años?',
  '¿Qué es lo más importante para ti en una relación?',
  '¿En qué área de tu vida quieres crecer este año?',
  '¿Cómo quieres que resolvamos los conflictos juntos?',
  '¿Qué aventura grande quieres vivir conmigo?',
  '¿Qué valor es el más importante para ti?',
  '¿Cómo te apoyo mejor cuando estás pasando un momento difícil?',
  '¿Qué sueño tuyo quieres que sea también mío?',
  '¿Qué significa para ti el compromiso?',
  '¿Qué tradición quieres que creemos juntos?',
  '¿Cómo imaginas nuestro hogar ideal?',
  '¿Qué te hace sentir más seguro en nuestra relación?',
  '¿Qué cosa de ti mismo quieres mejorar para ser mejor pareja?',
  '¿Qué papel quieres que juegue la familia en nuestra vida juntos?',
  '¿Cómo manejas el estrés y qué puedo hacer para ayudarte?',
  '¿Qué metas financieras quieres que tengamos como pareja?',
  '¿Qué cosa nueva quieres aprender conmigo?',
  '¿Qué significa para ti el equilibrio entre espacio personal y tiempo juntos?',
  '¿Cómo quieres celebrar los logros del otro?',
  '¿Qué legado quieres dejar como pareja?',
  '¿Qué es lo que más admiras de cómo enfrentas los retos?',
  '¿Qué momento de tu vida te ha formado más como persona?',
  '¿Qué necesitas de mí que todavía no te he dado?',
]

// Legacy alias — kept for any existing references
export const QUESTIONS = QUESTIONS_CONOCERNOS

export const INDEX_OFFSET_CRECER = 1000
