package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import co.uniandes.boletamaster.persistence.api.OrdenItemRepository;

import java.sql.*;

public class OrdenItemJdbcDAO implements OrdenItemRepository {

    public void agregar(long ordenId, long tiqueteId, long precioUnitCent) throws Exception {
        String sql = "INSERT INTO orden_item(id_orden,tiquete_id,cantidad,precio_unit_cent,subtotal_cent) VALUES (?,?,1,?,?)";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, ordenId);
            ps.setLong(2, tiqueteId);
            ps.setLong(3, precioUnitCent);
            ps.setLong(4, precioUnitCent);
            ps.executeUpdate();
        }
    }
}
