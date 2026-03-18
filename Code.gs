// INSTRUCCIONES PARA USAR ESTE SISTEMA
// ======================================
// 
// Este archivo contiene el codigo de Apps Script que debes copiar
// en Google Apps Script para que el sistema funcione completamente.
// 
// PASOS:
// 1. Crea una nueva Google Sheet
// 2. Ve a Extensiones > Apps Script
// 3. Copia TODO este codigo y pegalo en Code.gs
// 4. Crea 3 hojas en tu Sheet:
//    - Profes (columnas: Nombre, Materia, Turno, Dia, Horario, Capacidad, Asignados)
//    - Alumnos (columnas: DNI, Nombre, Previas, FechaAsignacion)
//    - Asignaciones (columnas: DNI, NombreAlumno, Materia, Profesor, Dia, Horario, Turno, Fecha)
// 5. Copia el ID de tu Sheet (esta en la URL)
// 6. Reemplaza 'TU_SHEET_ID_AQUI' abajo con tu ID real
// 7. Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 8. Copia la URL que te da y pegala en index.html en la linea:
//    const SCRIPT_URL = 'TU_APPS_SCRIPT_URL_AQUI';
// 9. Sube el index.html actualizado a GitHub
// 10. Activa GitHub Pages en Settings > Pages > Source: main branch
// 
// NOTA: Este sistema guarda datos en localStorage del navegador como backup,
// pero para un sistema completo con persistencia, implementa la integracion
// con Google Sheets usando este codigo.

const SHEET_ID = 'TU_SHEET_ID_AQUI';  // Reemplazar con el ID de tu Google Sheet

function doPost(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  
  try {
    if (action === 'guardarProf') {
      const nombre = e.parameter.nombre;
      const materia = e.parameter.materia;
      const turno = e.parameter.turno;
      const dia = e.parameter.dia;
      const horario = e.parameter.horario;
      const capacidad = parseInt(e.parameter.capacidad);
      
      const profesSheet = sheet.getSheetByName('Profes');
      profesSheet.appendRow([nombre, materia, turno, dia, horario, capacidad, 0]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Profesor guardado' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'asignarAlumno') {
      const dni = e.parameter.dni;
      const nombre = e.parameter.nombre;
      const previas = e.parameter.previas.split(',').map(p => p.trim()).slice(0, 4);
      
      const profesSheet = sheet.getSheetByName('Profes');
      const data = profesSheet.getDataRange().getValues();
      
      let asignaciones = [];
      
      for (let previa of previas) {
        // Buscar profes disponibles para esa materia
        let disponibles = [];
        for (let i = 1; i < data.length; i++) {
          if (data[i][1].toLowerCase().includes(previa.toLowerCase()) && 
              data[i][6] < data[i][5]) {
            disponibles.push({ row: i, asignados: data[i][6] });
          }
        }
        
        if (disponibles.length === 0) {
          asignaciones.push({ materia: previa, success: false, mensaje: 'No hay cupo' });
          continue;
        }
        
        // Ordenar por menos asignados (reparto equitativo)
        disponibles.sort((a, b) => a.asignados - b.asignados);
        const elegido = disponibles[0];
        
        const profesor = data[elegido.row][0];
        const dia = data[elegido.row][3];
        const horario = data[elegido.row][4];
        const turno = data[elegido.row][2];
        
        // Actualizar contador
        data[elegido.row][6]++;
        profesSheet.getRange(elegido.row + 1, 7).setValue(data[elegido.row][6]);
        
        // Registrar en hoja Asignaciones
        const asigSheet = sheet.getSheetByName('Asignaciones');
        asigSheet.appendRow([dni, nombre, previa, profesor, dia, horario, turno, new Date()]);
        
        asignaciones.push({
          materia: previa,
          success: true,
          profesor: profesor,
          dia: dia,
          horario: horario,
          turno: turno
        });
      }
      
      // Registrar alumno
      const alumnosSheet = sheet.getSheetByName('Alumnos');
      alumnosSheet.appendRow([dni, nombre, previas.join(','), new Date()]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, asignaciones: asignaciones }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getProfes') {
      const profesSheet = sheet.getSheetByName('Profes');
      const data = profesSheet.getDataRange().getValues();
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, profes: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return doPost(e);
}

// Funcion para resetear los contadores (opcional, ejecutar manualmente)
function resetearContadores() {
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const profesSheet = sheet.getSheetByName('Profes');
  const lastRow = profesSheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    profesSheet.getRange(i, 7).setValue(0);
  }
  
  Logger.log('Contadores reseteados');
}
