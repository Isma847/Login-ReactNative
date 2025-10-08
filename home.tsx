import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
    const router = useRouter();
    const { username } = useLocalSearchParams(); 
    const goToLogIn = () => {
        router.push('/(tabs)'); 
    };

  return (
    <ScrollView  style={{backgroundColor:'#292929'}} contentContainerStyle={{flexGrow:1, justifyContent:'center'}}>
        <View style={{alignSelf: "center"}}>
            <Text style={{fontSize:20, textAlign:'center', fontWeight:600, marginBottom:10, color:'white'}}>Se inicio correctamente la sesión.</Text>
            <Text style={{fontSize:20, textAlign:'center', fontWeight:500, marginBottom:10, color:'white'}}>¡Bienvenido, {username}!</Text> 
            <TouchableOpacity onPress={goToLogIn}>
                <Text style={{color: '#2bff60', fontWeight: 'bold', fontSize:18, textAlign:'center'}}>Volver</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
});
