import { StyleSheet, Text, View } from 'react-native';

export default function CompletedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Trips</Text>
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#E2E8F0',
  },
});
