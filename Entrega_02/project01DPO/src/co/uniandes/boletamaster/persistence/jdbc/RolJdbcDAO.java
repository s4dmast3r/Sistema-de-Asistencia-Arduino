
package co.uniandes.boletamaster.persistence.jdbc;
import co.uniandes.boletamaster.persistence.SQLite; import co.uniandes.boletamaster.persistence.api.RolRepository;
import java.sql.*;
public class RolJdbcDAO implements RolRepository {
    public void registrarComprador(String login,long saldoInicial) throws Exception {
        try (Connection c = SQLite.get()) {
            try (PreparedStatement ps = c.prepareStatement("INSERT OR IGNORE INTO comprador(login) VALUES(?)")) { ps.setString(1, login); ps.executeUpdate(); }
            try (PreparedStatement ps = c.prepareStatement("INSERT OR IGNORE INTO billetera(comprador_login,saldo_centavos) VALUES(?,?)")) { ps.setString(1, login); ps.setLong(2, saldoInicial); ps.executeUpdate(); }
        }
    }
    public void registrarEmpleado(String login) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("INSERT OR IGNORE INTO empleado(login) VALUES(?)")) { ps.setString(1, login); ps.executeUpdate(); }
    }
    public void registrarOrganizador(String login,String empresa) throws Exception {
        registrarEmpleado(login);
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("INSERT OR IGNORE INTO organizador(login,empresa) VALUES(?,?)")) { ps.setString(1, login); ps.setString(2, empresa); ps.executeUpdate(); }
    }
    public void registrarAdministrador(String login) throws Exception {
        registrarEmpleado(login);
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("INSERT OR IGNORE INTO administrador(login) VALUES(?)")) { ps.setString(1, login); ps.executeUpdate(); }
    }
}
