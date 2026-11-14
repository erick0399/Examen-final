
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const API_URL =
  'https://api-examen-final-ofvn.onrender.com/api';

export default function App() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [pantalla, setPantalla] = useState('catalogo');
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState('');
  const [errorDetalle, setErrorDetalle] = useState('');

  useEffect(() => {
    cargarCursos();
  }, []);

  async function consultarAPI(ruta) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { Accept: 'application/json' },
    });

    const json = await respuesta.json();

    if (!respuesta.ok || !json.success) {
      throw new Error(json.message || 'Error al consultar la API');
    }

    return json.data;
  }

  async function cargarCursos() {
    try {
      setCargando(true);
      setError('');

      const datos = await consultarAPI('/cursos');
      setCursos(Array.isArray(datos) ? datos : []);
    } catch (e) {
      setError(e.message || 'No fue posible conectar');
    } finally {
      setCargando(false);
    }
  }

  async function abrirDetalle(id) {
    setPantalla('detalle');
    setCursoSeleccionado(null);
    setCargandoDetalle(true);
    setErrorDetalle('');

    try {
      const datos = await consultarAPI(`/cursos/${id}`);
      setCursoSeleccionado(datos);
    } catch (e) {
      setErrorDetalle(e.message || 'No se pudo cargar el curso');
    } finally {
      setCargandoDetalle(false);
    }
  }

  function regresar() {
    setPantalla('catalogo');
    setCursoSeleccionado(null);
    setErrorDetalle('');
  }

  function mostrarValor(valor) {
    if (valor === null || valor === undefined || valor === '') {
      return 'No disponible';
    }
    return String(valor);
  }

  function renderCurso({ item }) {
    return (
      <Pressable
        style={styles.tarjeta}
        onPress={() => abrirDetalle(item.id)}
      >
        <View style={styles.fila}>
          <View style={styles.iconoCurso}>
            <Text style={styles.iconoTexto}>📚</Text>
          </View>

          <View style={styles.infoCurso}>
            <Text style={styles.nombreCurso}>{item.nombre}</Text>
            <Text style={styles.categoria}>
              {item.categoria?.nombre ?? 'Sin categoría'}
            </Text>
          </View>
        </View>

        <View style={styles.pieTarjeta}>
          <Text style={styles.duracion}>
            ⏱ {item.duracion_horas} horas
          </Text>
          <Text style={styles.verDetalle}>Ver detalles ›</Text>
        </View>
      </Pressable>
    );
  }

  function campoDetalle(etiqueta, valor) {
    return (
      <View style={styles.campo}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        <Text style={styles.valor}>{mostrarValor(valor)}</Text>
      </View>
    );
  }

  if (pantalla === 'detalle') {
    return (
      <SafeAreaView style={styles.contenedor}>
        <StatusBar barStyle="light-content" />

        <View style={styles.encabezado}>
          <Pressable onPress={regresar} style={styles.volver}>
            <Text style={styles.textoVolver}>‹ Regresar al catálogo</Text>
          </Pressable>

          <Text style={styles.titulo}>Detalle del curso</Text>
          <Text style={styles.subtitulo}>
            Información académica
          </Text>
        </View>

        {cargandoDetalle ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.mensaje}>
              Consultando información del curso...
            </Text>
          </View>
        ) : errorDetalle ? (
          <View style={styles.centro}>
            <Text style={styles.error}>{errorDetalle}</Text>
            <Pressable style={styles.boton} onPress={regresar}>
              <Text style={styles.textoBoton}>Regresar</Text>
            </Pressable>
          </View>
        ) : cursoSeleccionado ? (
          <ScrollView
            contentContainerStyle={styles.detalleContenido}
          >
            <View style={styles.detalleTarjeta}>
              <Text style={styles.iconoGrande}>🎓</Text>

              <Text style={styles.detalleTitulo}>
                {cursoSeleccionado.nombre}
              </Text>

              <Text style={styles.detalleSubtitulo}>
                {cursoSeleccionado.categoria?.nombre ??
                  'Sin categoría'}
              </Text>

              <View style={styles.divisor} />

              <Text style={styles.seccionDetalle}>
                Características del curso
              </Text>

              {campoDetalle(
                'Categoría',
                cursoSeleccionado.categoria?.nombre
              )}

              {campoDetalle(
                'Duración',
                `${cursoSeleccionado.duracion_horas} horas`
              )}

              {campoDetalle(
                'Nivel',
                cursoSeleccionado.nivel
              )}

              <Text style={styles.etiqueta}>Descripción</Text>

              <Text style={styles.descripcion}>
                {mostrarValor(cursoSeleccionado.descripcion)}
              </Text>
            </View>

            <Pressable style={styles.botonRegresar} onPress={regresar}>
              <Text style={styles.textoBoton}>
                ← Volver a todos los cursos
              </Text>
            </Pressable>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.encabezado}>
        <Text style={styles.titulo}>📚 Catálogo Académico</Text>
        <Text style={styles.subtitulo}>
          Descubre nuestros cursos disponibles
        </Text>
      </View>

      <View style={styles.contenido}>
        <View style={styles.filaTitulo}>
          <Text style={styles.seccion}>Cursos disponibles</Text>
          <Text style={styles.contador}>{cursos.length} cursos</Text>
        </View>

        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.mensaje}>Cargando cursos...</Text>
          </View>
        ) : error ? (
          <View style={styles.centro}>
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.boton} onPress={cargarCursos}>
              <Text style={styles.textoBoton}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={cursos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCurso}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <Text style={styles.mensaje}>
                No hay cursos disponibles.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  encabezado: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 22,
    paddingTop: 45,
    paddingBottom: 28,
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 7,
  },
  volver: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  textoVolver: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  contenido: {
    flex: 1,
    padding: 18,
  },
  filaTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  contador: {
    fontSize: 13,
    color: '#64748b',
  },
  lista: {
    paddingBottom: 25,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    padding: 17,
    borderRadius: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoCurso: {
    width: 52,
    height: 52,
    backgroundColor: '#dbeafe',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  iconoTexto: {
    fontSize: 25,
  },
  infoCurso: {
    flex: 1,
  },
  nombreCurso: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  categoria: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 5,
  },
  pieTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  duracion: {
    color: '#475569',
    fontSize: 13,
  },
  verDetalle: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 13,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  mensaje: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 14,
  },
  error: {
    color: '#dc2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  boton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
  detalleContenido: {
    padding: 18,
    paddingBottom: 35,
  },
  detalleTarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 23,
    elevation: 3,
  },
  iconoGrande: {
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 15,
  },
  detalleTitulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  detalleSubtitulo: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  divisor: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 24,
  },
  seccionDetalle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  campo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 6,
  },
  valor: {
    fontSize: 16,
    color: '#0f172a',
  },
  descripcion: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginTop: 5,
  },
  botonRegresar: {
    backgroundColor: '#2563eb',
    padding: 17,
    borderRadius: 13,
    marginTop: 20,
  },
});
