import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const OptionItem = ({ icon, title, onPress, isDestructive = false }) => {
  return (
    <TouchableOpacity 
      style={[
        itemStyles.container, 
        isDestructive && itemStyles.destructiveContainer
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={itemStyles.iconWrapper}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? '#FF3B30' : '#007AFF'} 
        />
      </View>
      <Text style={[
        itemStyles.title, 
        isDestructive && itemStyles.destructiveTitle
      ]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20, // Aire para que no esté pegado al borde
    borderRadius: 16,
    marginBottom: 12,
    // Sombra suave estilo iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  destructiveContainer: {
    backgroundColor: '#FFF5F5', // Fondo rojizo suave
  },
  iconWrapper: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  destructiveTitle: {
    color: '#FF3B30',
  }
});