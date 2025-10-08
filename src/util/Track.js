// util/Track.js
export default class Track {
  constructor(y, id) {
    this.y = y;    // Coordenada vertical del carril
    this.id = id;  // Identificador único del carril (0, 1, 2, 3)
  }

  // Método auxiliar para verificar si una posición Y está en este carril
  containsY(yPos, tolerance = 30) {
    return Math.abs(yPos - this.y) < tolerance;
  }
}