
package co.uniandes.boletamaster.cli;
import co.uniandes.boletamaster.persistence.Migrations;
public class Main {
    public static void main(String[] args) {
        try {
            Migrations.runAll();
            Seeder.run();
            new Menu().run();
        } catch (Exception e) { e.printStackTrace(); }
    }
}
