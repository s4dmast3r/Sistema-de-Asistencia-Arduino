package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import co.uniandes.boletamaster.persistence.api.PagoRepository;

import java.sql.*;

public class PagoJdbcDAO implements PagoRepository {

    public void registrar(long ordenId, String metodo, long montoCent, String fecha, boolean aprobado) throws Exception {
        String sql = "INSERT INTO pago(id_orden,metodo,monto_cent,fecha,aprobado) VALUES (?,?,?,?,?)";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, ordenId);
            ps.setString(2, metodo);
            ps.setLong(3, montoCent);
            ps.setString(4, fecha);
            ps.setInt(5, aprobado ? 1 : 0);
            ps.executeUpdate();
        }
    }
}
