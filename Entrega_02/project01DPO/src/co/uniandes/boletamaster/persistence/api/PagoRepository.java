package co.uniandes.boletamaster.persistence.api;

public interface PagoRepository {
    void registrar(long ordenId, String metodo, long montoCent, String fecha, boolean aprobado) throws Exception;
}
