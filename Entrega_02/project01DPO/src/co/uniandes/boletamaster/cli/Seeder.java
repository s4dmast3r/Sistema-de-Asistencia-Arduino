
package co.uniandes.boletamaster.cli;
import co.uniandes.boletamaster.service.CuentaService;
import co.uniandes.boletamaster.persistence.jdbc.*;
public class Seeder {
    public static void run() throws Exception {
        CuentaService cuentas = new CuentaService(new UsuarioJdbcDAO(), new CredencialJdbcDAO(), new RolJdbcDAO());
        cuentas.registrarAdministrador("admin@bm","Admin","admin@bm","admin123");
        cuentas.registrarOrganizador("org@bm","Organizador Uno","org@bm","org123","Promotor Uno");
        cuentas.registrarComprador("c1@bm","Cliente Uno","c1@bm","c1pass",1500000);
        cuentas.registrarComprador("c2@bm","Cliente Dos","c2@bm","c2pass",900000);
    }
}
