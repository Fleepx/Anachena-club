# Anachena — Inventario del salón

Sistema de inventario para el salón de eventos del **Club Ana Chena**. Lleva el stock del
salón, calcula qué falta comprar para cada evento y registra qué se rompió al terminar.

**Maqueta en vivo:** https://fleepx.github.io/Anachena-club/

---

## El problema que resuelve

Antes de cada evento hay que contar los insumos a mano, las planillas de papel se pierden y
nadie sabe el stock real ni qué se rompió el fin de semana pasado. Acá el dato **sobrevive
de un evento al siguiente**.

---

## Lo primero: conectar el equipo

La app **no abre sin conexión**. Al entrar pide la cuenta, el repositorio de datos y un
token de acceso; los dos primeros vienen cargados y solo hay que pegar el token.

No es un paso opcional a propósito: el sentido del sistema es que todos trabajen sobre la
misma información. Un equipo que guardara solo para sí mismo llevaría una contabilidad
paralela sin que nadie se entere, que es exactamente el problema que hay que evitar.

Una vez conectado, los cambios de los demás aparecen solos, sin recargar, en unos segundos.

> **El primer equipo que se conecta es el que manda.** Sube su información al repositorio y
> los demás la bajan. Conectá primero el que tenga los datos buenos.

Si el token vence, la app vuelve sola a pedir uno nuevo. Si falla la conexión, aparece una
franja amarilla arriba: mientras esté ahí los cambios se guardan en ese equipo pero no
viajan, y la actualización se pausa para no pisar lo que todavía no se subió.

---

## Las dos naturalezas del stock

Toda la app se apoya en esta distinción, y es la razón de que haya dos pestañas de
inventario en vez de una:

| | **Menaje e inmueble** | **Insumos de comida** |
|---|---|---|
| Qué es | Copas, sillas, manteles, proyector | Carne, verdura, bebida, hielo |
| Al terminar el evento | **Vuelve** al depósito | **No vuelve**, se consumió |
| Qué importa | Cuánto se rompió | Reponer a tiempo |

Por eso cuatro bodas de 250 personas no necesitan 1.000 copas: necesitan 250, que van y
vuelven. Pero sí necesitan la carne de las cuatro.

---

## Las pestañas

**Resumen** — los eventos que vienen, cuánta gente, y para cada uno qué falta comprar con
el costo estimado. Desde acá se genera la cotización y se prepara el correo al cliente.

**Mes** — la orden de compra consolidada. Elegís el mes y te dice todo lo que hay que
comprar junto, no evento por evento. Se puede tocar un evento del calendario para sacarlo
del cálculo o sumar uno del mes siguiente.

**Insumos de comida** y **Menaje e inmueble** — el inventario. Se edita el stock, el mínimo
y la ubicación. Desde el botón *Planilla* se descarga o se carga un archivo para contar en
Excel.

**Plantillas** — qué lleva cada tipo de evento. Están separadas en tres:

- **Montaje** — el menaje. Va con el tipo de evento (boda, graduación)
- **Menú** — lo que se cocina. Lo elige el cliente en cada evento
- **Cóctel** — los bocados, si hay

**Balance** — ingresos, egresos y margen por mes y por evento. Solo lo ve el perfil Admin.

**Roturas** — el parte de cada evento que ya pasó.

---

## El ciclo de un evento

1. **Agendar** con *Nuevo evento*: cliente, fecha, cuánta gente, y qué montaje, menú y
   cóctel lleva. Avisa si hay otro evento el mismo día o si la gente no entra.
2. **Cotizar** desde el Resumen. Genera el PDF y prepara el correo al cliente.
3. **Comprar** lo que falta, con la lista de la pestaña Mes.
4. **Cerrar** el evento en Roturas, al día siguiente: se cuenta el menaje que volvió y se
   carga lo roto o lo que no apareció. Eso descuenta del inventario.
5. **Cobrar la rotura**, si corresponde. Sobre cierto monto la app marca el parte y ofrece
   generar el acta para el cliente. **Cobrar o no siempre lo decide el club.**

> Un evento donde no se rompió nada **también se cierra**: el botón dice *"Cerrar sin
> roturas"*. Es importante hacerlo igual, porque mientras un evento siga abierto el stock
> que ves no es el real.

---

## Perfiles

El selector de arriba cambia entre **Admin** y **Personal**.

- **Admin** ve todo y edita todo, incluido el Balance.
- **Personal** consulta el inventario y carga el conteo de un evento, pero lo que carga
  queda como **borrador** hasta que un Admin lo confirma. Recién ahí se descuenta el stock,
  porque contar y dar de baja son dos cosas distintas.

---

## Cosas que conviene saber

**El selector de fecha** de arriba mueve el "día de hoy" del sistema. Es para poder recorrer
el ciclo completo sin esperar a que pasen los eventos. En la versión final lo pone el
servidor.

**Los eventos marcados "PRUEBA"** son de ejemplo, para que se entienda cómo funciona. Se
borran todos juntos desde el pie de la pestaña Roturas, sin tocar el inventario.

**El correo se prepara, no se envía.** El botón abre tu programa de correo con el texto
escrito y el PDF queda descargado para adjuntarlo a mano. Enviar de verdad en nombre del
club es una decisión del cliente, no un detalle técnico.

**Los precios y el umbral de cobro** son provisorios hasta que el club confirme los suyos.

---

## Estado

Maqueta funcional para probar el flujo completo. Falta el catálogo real de items, los datos
de la empresa para el acta y la identidad visual definitiva.
