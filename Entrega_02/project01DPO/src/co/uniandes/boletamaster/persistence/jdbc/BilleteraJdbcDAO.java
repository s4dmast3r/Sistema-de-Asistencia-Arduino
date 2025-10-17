package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import co.uniandes.boletamaster.persistence.api.BilleteraRepository;

import java.sql.*;

public class BilleteraJdbcDAO implements BilleteraRepository {

    public long saldo(String login) throws Exception {
        String sql = "SELECT saldo_centavos FROM billetera WHERE comprador_login=?";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, login);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? rs.getLong(1) : 0;
        }
    }

    public boolean debitar(String login, long monto) throws Exception {
        try (Connection c = SQLite.get()) {
            try (PreparedStatement ps = c.prepareStatement("SELECT saldo_centavos FROM billetera WHERE comprador_login=?")) {
                ps.setString(1, login);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) return false;
                if (rs.getLong(1) < monto) return false;
            }
            try (PreparedStatement ps = c.prepareStatement("UPDATE billetera SET saldo_centavos = saldo_centavos - ? WHERE comprador_login=?")) {
                ps.setLong(1, monto);
                ps.setString(2, login);
                ps.executeUpdate();
                return true;
            }
        }
    }

    public void recargar(String login, long monto) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("UPDATE billetera SET saldo_centavos = saldo_centavos + ? WHERE comprador_login=?")) {
            ps.setLong(1, monto);
            ps.setString(2, login);
            ps.executeUpdate();
        }
    }
}
