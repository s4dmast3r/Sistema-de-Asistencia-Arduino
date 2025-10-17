
package co.uniandes.boletamaster.persistence;
import java.io.File; import java.sql.*; import co.uniandes.boletamaster.config.AppConfig;
public class SQLite {
    private static Connection conn;
    public static Connection get() throws SQLException {
        if (conn == null || conn.isClosed()) {
            File f = new File(AppConfig.DB_PATH); f.getParentFile().mkdirs();
            conn = DriverManager.getConnection("jdbc:sqlite:" + f.getAbsolutePath());
            try (Statement st = conn.createStatement()) { st.execute("PRAGMA foreign_keys=ON;"); }
            System.out.println("DB -> " + f.getAbsolutePath());
        } return conn;
    }
}
