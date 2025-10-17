package co.uniandes.boletamaster.persistence.api;

public interface OrdenRepository {
    long crear(String compradorLogin, String fecha, long totalCent) throws Exception;
    void actualizarEstado(long id, String estado) throws Exception;
}
