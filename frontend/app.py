"""
COLORLINK - Frontend Streamlit SaaS
Transformación Digital Inteligente en Pintura y Recubrimientos
"""
import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(
    page_title="COLORLINK | Recubrimientos Inteligentes",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom SaaS Corporate CSS (#1E3A8A Palette)
st.markdown("""
<style>
    .main-header {
        font-size: 28px;
        font-weight: 800;
        color: #1E3A8A;
    }
    .metric-card {
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 18px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
</style>
""", unsafe_allow_html=True)

# Sidebar Inteligente
st.sidebar.markdown("### 🎨 COLORLINK")
st.sidebar.caption("Transformación Digital en Pintura")

menu = st.sidebar.radio(
    "Menú Principal",
    [
        "🏠 Dashboard", 
        "👤 Clientes", 
        "📁 Proyectos", 
        "📸 Evidencias", 
        "🧠 Clasificaciones IA", 
        "📦 Inventario", 
        "📊 Analítica", 
        "⚙ Administración"
    ]
)

if menu == "🏠 Dashboard":
    st.markdown('<h1 class="main-header">Dashboard Ejecutivo COLORLINK</h1>', unsafe_allow_html=True)
    
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    col1.metric("Clientes Activos", "24", "+3")
    col2.metric("Proyectos Activos", "18", "6 en ejecución")
    col3.metric("Solicitudes Pend.", "5", "Revisión")
    col4.metric("Casos Escalados", "2", "Alta prioridad")
    col5.metric("Evidencias SHA", "142", "Verificadas")
    col6.metric("Incidencias", "3", "Humedad > 80%")

    st.markdown("---")
    st.subheader("Análisis de Sustratos e Inferencia Gemini")
    
    df = pd.DataFrame({
        "Sustrato": ["Acero al Carbono", "Concreto", "Galvanizado", "Tuberías"],
        "Metros Cuadrados": [14200, 9800, 3400, 2100]
    })
    fig = px.bar(df, x="Sustrato", y="Metros Cuadrados", color="Sustrato", color_discrete_sequence=["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD"])
    st.plotly_chart(fig, use_container_width=True)

elif menu == "🧠 Clasificaciones IA":
    st.subheader("Motor de Diagnóstico con Gemini 3.8 Flash")
    st.info("Sistema clasificado: Epóxico de Altos Sólidos + Poliuretano UV (ISO 12944 C5)")
    st.progress(96, text="Nivel de Confianza: 96%")
