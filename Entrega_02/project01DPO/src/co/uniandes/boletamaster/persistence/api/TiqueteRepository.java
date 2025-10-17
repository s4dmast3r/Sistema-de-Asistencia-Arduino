package co.uniandes.boletamaster.persistence.api;

import java.util.List;

public interface TiqueteRepository {
    List<Long> disponiblesNoNumerado(long localidadId, int cantidad) throws Exception;
    Long disponibleNumerado(long localidadId, long asientoId) throws Exception;
    void marcarVendido(List<Long> ids) throws Exception;
    void marcarTransferido(long id) throws Exception;
    Long idPorCodigo(String codigo) throws Exception;
    long precioTotalCent(long tiqueteId) throws Exception;
}
