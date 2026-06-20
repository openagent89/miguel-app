/**
 * mi-deals DB Migration Script — Bestands-Korrektur
 * 
 * Problem: applySmartRows() hat bis v=2 Bestände direkt erhöht
 *          und Wareneingänge mit status='geprüft' erstellt.
 * 
 * Dieses Script:
 * 1. Berechnet korrekte Bestände aus gebuchten Wareneingängen
 * 2. Zeigt Abweichungen an
 * 3. Korrigiert Bestände auf den Soll-Wert
 * 4. Fügt Audit-Log-Einträge für jede Korrektur hinzu
 * 
 * Ausführung:
 *   1. mi-deals.html öffnen
 *   2. Diese Datei in die Browser-Konsole (F12) kopieren und ausführen
 *   3. ODER: Datei über "Daten → JSON-Sicherung importieren" nutzen
 */

(function migrateStocks() {
  'use strict';
  
  // Zugriff auf globalen State (aus mi-deals.html)
  const state = window.state;
  const save = window.save;
  const note = window.note;
  
  if (!state) return console.error('Kein State gefunden. Bitte zuerst mi-deals.html öffnen und einloggen.');
  
  console.group('🔄 Bestands-Migration');
  
  // 1. Korrekte Bestände aus gebuchten Wareneingängen berechnen
  const expectedStocks = {};
  
  (state.deliveries || []).forEach(d => {
    if (d.status !== 'geprüft') return;
    (d.lines || []).forEach(l => {
      if (!l.sku) return;
      const received = l.received || 0;
      if (received <= 0) return;
      expectedStocks[l.sku] = (expectedStocks[l.sku] || 0) + received;
    });
  });
  
  // 2. Vergleichen mit aktuellen Beständen
  const corrections = [];
  
  (state.products || []).forEach(p => {
    const expected = expectedStocks[p.sku] || 0;
    const current = p.stock || 0;
    const diff = expected - current;
    
    if (Math.abs(diff) > 0.0001) {
      corrections.push({
        sku: p.sku,
        name: p.name,
        current: current,
        expected: expected,
        diff: diff
      });
    }
  });
  
  // 3. Ausgabe der Analyse
  console.log('Gebuchte Wareneingänge:', Object.keys(expectedStocks).length, 'SKUs');
  console.log('Produkte gesamt:', (state.products || []).length);
  console.log('Abweichungen gefunden:', corrections.length);
  
  if (corrections.length === 0) {
    console.log('✅ Alle Bestände sind korrekt — keine Migration nötig.');
    console.groupEnd();
    if (note) note('Bestandsprüfung: Alle Bestände sind korrekt.');
    return;
  }
  
  console.table(corrections.map(c => ({
    'SKU': c.sku,
    'Artikel': c.name,
    'Aktuell': c.current,
    'Soll': c.expected,
    'Δ': (c.diff > 0 ? '+' : '') + c.diff
  })));
  
  // 4. Korrektur ausführen
  console.log('📝 Führe Korrektur aus...');
  
  const auditLog = state.auditLog || [];
  const now = new Date().toISOString();
  let fixCount = 0;
  
  corrections.forEach(c => {
    const product = state.products.find(p => p.sku === c.sku);
    if (!product) return;
    
    const oldStock = product.stock;
    product.stock = c.expected;
    
    // Audit-Log-Eintrag
    auditLog.unshift({
      id: Date.now() + Math.random(),
      sku: c.sku,
      name: c.name,
      change: c.diff,
      stockBefore: oldStock,
      stockAfter: c.expected,
      reason: 'Migration: Bestands-Korrektur (applySmartRows-Entkopplung)',
      deliveryNumber: 'MIGRATION',
      timestamp: now
    });
    
    fixCount++;
  });
  
  state.auditLog = auditLog;
  state.version = 3;
  
  // 5. Speichern
  if (save) save();
  
  console.log(`✅ ${fixCount} Bestände korrigiert, ${corrections.length - fixCount} übersprungen.`);
  console.log('💾 State wurde gespeichert und in die Cloud synchronisiert.');
  console.groupEnd();
  
  if (note) note(`Migration: ${fixCount} Bestände korrigiert. Audit-Log wurde aktualisiert.`);
  
  // Rückgabe für manuelle Inspektion
  return {
    corrections: corrections,
    fixed: fixCount,
    auditEntries: fixCount
  };
})();
