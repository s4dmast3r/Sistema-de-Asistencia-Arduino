
package co.uniandes.boletamaster.persistence;
import java.io.*; import java.nio.charset.StandardCharsets; import java.sql.*; import java.util.stream.Collectors;
public class Migrations {
    private static String load(String path) throws Exception {
        try (InputStream in = Migrations.class.getResourceAsStream(path)) {
            try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                return br.lines().collect(Collectors.joining("\n"));
            }
        }
    }
    public static void runAll() throws Exception { run("/sql/1_init.sql"); run("/sql/2_seed.sql"); }
    private static void run(String res) throws Exception {
        String sql = load(res);
        try (Connection c = SQLite.get(); Statement st = c.createStatement()) {
            for (String raw : sql.split(";")) {
                String s = raw.trim();
                if (s.isEmpty()) continue;
                st.execute(s);
            }
        }
    }
}
