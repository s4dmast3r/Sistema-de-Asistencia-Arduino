package co.uniandes.boletamaster.persistence.api;

public interface OrdenItemRepository {
    void agregar(long ordenId, long tiqueteId, long precioUnitCent) throws Exception;
}
