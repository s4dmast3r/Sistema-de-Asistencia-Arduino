package co.uniandes.boletamaster.domain.venta;

import java.util.ArrayList;
import java.util.List;
import co.uniandes.boletamaster.domain.valor.Money;

public class Orden {
    private long id;
    private String compradorLogin;
    private String fecha;
    private EstadoOrden estado;
    private Money total;
    private List<OrdenItem> items;
    public Orden(long id, String compradorLogin, String fecha) {
        this.id = id; this.compradorLogin = compradorLogin; this.fecha = fecha;
        this.estado = EstadoOrden.PENDIENTE; this.total = new Money(0); this.items = new ArrayList<>();
    }
    public void agregar(OrdenItem item) { items.add(item); total = total.add(item.subtotal()); }
    public void marcarPagada() { this.estado = EstadoOrden.PAGADA; }
    public Money getTotal() { return total; }
}
