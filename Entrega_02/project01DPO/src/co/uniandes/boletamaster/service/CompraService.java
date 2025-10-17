package co.uniandes.boletamaster.service;

import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import co.uniandes.boletamaster.persistence.Tx;
import co.uniandes.boletamaster.persistence.api.BilleteraRepository;
import co.uniandes.boletamaster.persistence.api.OrdenItemRepository;
import co.uniandes.boletamaster.persistence.api.OrdenRepository;
import co.uniandes.boletamaster.persistence.api.PagoRepository;
import co.uniandes.boletamaster.persistence.api.TiqueteRepository;

public class CompraService {

    private final TiqueteRepository tiquetes;
    private final OrdenRepository ordenes;
    private final OrdenItemRepository items;
    private final PagoRepository pagos;
    private final BilleteraRepository billeteras;

    public CompraService(TiqueteRepository t, OrdenRepository o, OrdenItemRepository i, PagoRepository p, BilleteraRepository b) {
        this.tiquetes = t; this.ordenes = o; this.items = i; this.pagos = p; this.billeteras = b;
    }

    public long comprarNoNumerado(String login, long localidadId, int cantidad) throws Exception {
        return Tx.inTransaction((Connection c) -> {
            List<Long> ids = tiquetes.disponiblesNoNumerado(localidadId, cantidad);
            if (ids.size() != cantidad) throw new IllegalStateException("Cupo insuficiente");
            long total = 0;
            for (Long id : ids) total += tiquetes.precioTotalCent(id);
            long ordenId = ordenes.crear(login, LocalDateTime.now().toString(), total);
            for (Long id : ids) {
                long precio = tiquetes.precioTotalCent(id);
                items.agregar(ordenId, id, precio);
            }
            boolean debito = billeteras.debitar(login, total);
            pagos.registrar(ordenId, "SALDO", total, LocalDateTime.now().toString(), debito);
            if (!debito) {
                ordenes.actualizarEstado(ordenId, "FALLIDA");
                throw new IllegalStateException("Saldo insuficiente");
            }
            tiquetes.marcarVendido(ids);
            ordenes.actualizarEstado(ordenId, "PAGADA");
            return ordenId;
        });
    }

    public long comprarNumerado(String login, long localidadId, List<Long> asientos) throws Exception {
        return Tx.inTransaction((Connection c) -> {
            List<Long> ids = new ArrayList<>();
            for (Long asientoId : asientos) {
                Long id = tiquetes.disponibleNumerado(localidadId, asientoId);
                if (id == null) throw new IllegalStateException("Asiento no disponible: " + asientoId);
                ids.add(id);
            }
            long total = 0;
            for (Long id : ids) total += tiquetes.precioTotalCent(id);

            long ordenId = ordenes.crear(login, LocalDateTime.now().toString(), total);
            for (Long id : ids) {
                long precio = tiquetes.precioTotalCent(id);
                items.agregar(ordenId, id, precio);
            }
            boolean debito = billeteras.debitar(login, total);
            pagos.registrar(ordenId, "SALDO", total, LocalDateTime.now().toString(), debito);
            if (!debito) {
                ordenes.actualizarEstado(ordenId, "FALLIDA");
                throw new IllegalStateException("Saldo insuficiente");
            }
            tiquetes.marcarVendido(ids);
            ordenes.actualizarEstado(ordenId, "PAGADA");
            return ordenId;
        });
    }
}
