package co.uniandes.boletamaster.domain.venta;

import co.uniandes.boletamaster.domain.valor.Money;

public class OrdenItem {
    private long id;
    private long tiqueteId;
    private int cantidad;
    private Money precioUnitario;
    public OrdenItem(long id, long tiqueteId, int cantidad, Money precioUnitario) { this.id = id; this.tiqueteId = tiqueteId; this.cantidad = cantidad; this.precioUnitario = precioUnitario; }
    public Money subtotal() { return precioUnitario.multiply(cantidad); }
}
