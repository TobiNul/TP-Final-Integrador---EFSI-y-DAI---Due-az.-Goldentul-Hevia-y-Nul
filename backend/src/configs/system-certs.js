// Suma los certificados del sistema operativo a los que Node trae de fábrica. Sin esto, las redes
// que inspeccionan HTTPS (firewalls de escuelas y empresas) cortan las llamadas a OMDb y Twitch.
import tls from 'node:tls';

if (tls.setDefaultCACertificates) {
  tls.setDefaultCACertificates([
    ...tls.getCACertificates('default'),
    ...tls.getCACertificates('system'),
  ]);
}
