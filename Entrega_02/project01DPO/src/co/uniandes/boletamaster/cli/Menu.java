package co.uniandes.boletamaster.cli;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import co.uniandes.boletamaster.persistence.jdbc.*;
import co.uniandes.boletamaster.service.*;

public class Menu {

    private final CuentaService cuentas;
    private final CompraService compras;
    private final TransferenciaService transferencias;

    public Menu() {
        this.cuentas = new CuentaService(new UsuarioJdbcDAO(), new CredencialJdbcDAO(), new RolJdbcDAO());
        this.compras = new CompraService(new TiqueteJdbcDAO(), new OrdenJdbcDAO(), new OrdenItemJdbcDAO(), new PagoJdbcDAO(), new BilleteraJdbcDAO());
        this.transferencias = new TransferenciaService(new TiqueteJdbcDAO());
    }

    public void run() throws Exception {
        Scanner sc = new Scanner(System.in);
        System.out.print("login: ");
        String login = sc.nextLine();
        System.out.print("password: ");
        String pass = sc.nextLine();
        if (!cuentas.autenticar(login, pass)) {
            System.out.println("Credenciales inválidas");
            return;
        }
        System.out.println("Bienvenido, " + login);
        while (true) {
            System.out.println("\n1) Comprar GENERAL (no numerado)");
            System.out.println("2) Comprar PLATEA (numerado)");
            System.out.println("3) Transferir tiquete por código");
            System.out.println("4) Salir");
            String op = sc.nextLine();
            try {
                if ("1".equals(op)) {
                    long locGeneral = new LocalidadJdbcDAO().idPorNombre("e1","GENERAL");
                    System.out.print("Cantidad: ");
                    int n = Integer.parseInt(sc.nextLine());
                    long ordenId = compras.comprarNoNumerado(login, locGeneral, n);
                    System.out.println("Orden PAGADA id=" + ordenId);
                } else if ("2".equals(op)) {
                    long locPlatea = new LocalidadJdbcDAO().idPorNombre("e1","PLATEA");
                    System.out.print("Asientos A-#: ej 1,2: ");
                    String[] nums = sc.nextLine().split(",");
                    List<Long> asientos = new ArrayList<>();
                    for (String s : nums) {
                        long aid = new AsientoJdbcDAO().idPorFilaNumero(locPlatea, "A", Integer.parseInt(s.trim()));
                        asientos.add(aid);
                    }
                    long ordenId = compras.comprarNumerado(login, locPlatea, asientos);
                    System.out.println("Orden PAGADA id=" + ordenId);
                } else if ("3".equals(op)) {
                    System.out.print("Código tiquete: ");
                    String cod = sc.nextLine();
                    System.out.print("Login destino: ");
                    String dest = sc.nextLine();
                    transferencias.transferir(cod, login, dest);
                    System.out.println("Transferencia realizada.");
                } else if ("4".equals(op)) break;
            } catch (Exception e) {
                System.out.println("Error: " + e.getMessage());
            }
        }
    }
}