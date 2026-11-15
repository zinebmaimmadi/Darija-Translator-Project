import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Android emulator: 10.0.2.2; iOS simulator: localhost; real phone: computer's LAN IP.
const API_URL = 'http://10.0.2.2:8082/api/translator/translate';
const USER = 'student';
const PASSWORD = 'translator';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64Ascii(s) { // Demo credentials are ASCII; do not embed real production secrets.
  const bytes = Array.from(s).map(c => c.charCodeAt(0)); let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
    result += alphabet[(n >>> 18) & 63] + alphabet[(n >>> 12) & 63] +
      (i + 1 < bytes.length ? alphabet[(n >>> 6) & 63] : '=') +
      (i + 2 < bytes.length ? alphabet[n & 63] : '=');
  }
  return result;
}
export default function App() {
  const [text, setText] = useState(''); const [result, setResult] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function translate() {
    if (!text.trim()) { setError('Please enter some text.'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: {
        'Content-Type': 'application/json', Authorization: 'Basic ' + base64Ascii(USER + ':' + PASSWORD)
      }, body: JSON.stringify({ text, sourceLanguage: 'English', targetLanguage: 'Darija', style: 'natural' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || `HTTP ${response.status}`);
      setResult(data.translatedText || 'No translation returned.');
    } catch (e) { setError(String(e.message || e)); }
    finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.screen}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.body}>
    <Text style={styles.title}>Darija Translator</Text><Text style={styles.subtitle}>English → Moroccan Arabic</Text>
    <Text style={styles.label}>Text to translate</Text><TextInput multiline value={text} onChangeText={setText} placeholder="Type English text…" style={styles.input} />
    <TouchableOpacity style={styles.button} onPress={translate} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Translating…' : 'Translate'}</Text></TouchableOpacity>
    {loading && <ActivityIndicator style={{marginTop:20}} />}
    {!!error && <Text style={styles.error}>{error}</Text>}
    {!!result && <View style={styles.result}><Text style={styles.label}>Darija translation</Text><Text selectable style={styles.translation}>{result}</Text></View>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({screen:{flex:1,backgroundColor:'#f6f4fc'},body:{padding:24,paddingTop:55},title:{fontSize:30,fontWeight:'bold',color:'#37266c'},subtitle:{color:'#686080',marginTop:8,marginBottom:32},label:{fontSize:15,fontWeight:'600',marginBottom:10},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ddd5ee',borderRadius:12,padding:16,minHeight:130,textAlignVertical:'top',fontSize:16},button:{backgroundColor:'#6044c4',padding:16,borderRadius:12,alignItems:'center',marginTop:18},buttonText:{color:'#fff',fontWeight:'bold'},result:{backgroundColor:'#fff',padding:18,borderRadius:12,marginTop:24},translation:{fontSize:18,lineHeight:27},error:{color:'#a52c43',marginTop:20}});
