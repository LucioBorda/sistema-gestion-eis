import { MetodoCobro, TramoFechaCobranza, CalculoTarifaActual } from "./types";

/**
 * Calcula el tramo arancelario según el día del mes actual (o fecha dada)
 * y si se trata de un mes adeudado anterior.
 */
export function calcularTramoYTarifa(
  baseEfectivo: number,
  baseTransferencia: number,
  metodo: MetodoCobro,
  esMoraMesesAnteriores: boolean = false,
  fechaReferencia: Date = new Date()
): CalculoTarifaActual {
  const diaDelMes = fechaReferencia.getDate();
  const base = metodo === "Efectivo" ? baseEfectivo : baseTransferencia;

  if (esMoraMesesAnteriores) {
    const recargo = Math.round(base * 0.3);
    return {
      diaDelMes,
      tramo: "vencido_anterior",
      tramoNombre: "Mes Vencido / Adeudado (+30% mora acumulada)",
      porcentajeRecargo: 30,
      esMoraMesesAnteriores: true,
      montoFinal: base + recargo,
    };
  }

  if (diaDelMes <= 10) {
    return {
      diaDelMes,
      tramo: "tramo_1_10",
      tramoNombre: "Días 1 al 10 (Arancel Base sin recargo)",
      porcentajeRecargo: 0,
      esMoraMesesAnteriores: false,
      montoFinal: base,
    };
  }

  if (diaDelMes <= 19) {
    const recargo = Math.round(base * 0.1);
    return {
      diaDelMes,
      tramo: "tramo_11_19",
      tramoNombre: "Días 11 al 19 (+10% recargo)",
      porcentajeRecargo: 10,
      esMoraMesesAnteriores: false,
      montoFinal: base + recargo,
    };
  }

  // Días 20 al fin de mes
  const recargo = Math.round(base * 0.2);
  return {
    diaDelMes,
    tramo: "tramo_20_fin",
    tramoNombre: "Días 20 al fin de mes (+20% recargo)",
    porcentajeRecargo: 20,
    esMoraMesesAnteriores: false,
    montoFinal: base + recargo,
  };
}

/**
 * Retorna la matriz escalonada completa para un curso
 */
export function obtenerMatrizCurso(baseEfectivo: number, baseTransferencia: number) {
  return {
    efectivo: {
      dias1al10: baseEfectivo,
      dias11al19: Math.round(baseEfectivo * 1.1),
      dias20alFin: Math.round(baseEfectivo * 1.2),
      mesVencido: Math.round(baseEfectivo * 1.3),
    },
    transferencia: {
      dias1al10: baseTransferencia,
      dias11al19: Math.round(baseTransferencia * 1.1),
      dias20alFin: Math.round(baseTransferencia * 1.2),
      mesVencido: Math.round(baseTransferencia * 1.3),
    },
  };
}
