package co.uniandes.boletamaster.persistence.api;
public interface BilleteraRepository {
    long saldo(String login) throws Exception;
    boolean debitar(String login, long monto) throws Exception;
    void recargar(String login, long monto) throws Exception;
}
