package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import co.uniandes.boletamaster.persistence.api.OrdenRepository;

import java.sql.*;

public class OrdenJdbcDAO implements OrdenRepository {

    public long crear(String compradorLogin, String fecha, long totalCent) throws Exception {
        String sql = "INSERT INTO orden(comprador_login,fecha,estado,total_cent) VALUES (?,?, 'PENDIENTE', ?)";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, compradorLogin);
            ps.setString(2, fecha);
            ps.setLong(3, totalCent);
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            return rs.next() ? rs.getLong(1) : 0L;
        }
    }

    public void actualizarEstado(long id, String estado) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("UPDATE orden SET estado=? WHERE id_orden=?")) {
            ps.setString(1, estado);
            ps.setLong(2, id);
            ps.executeUpdate();
        }
    }
}
