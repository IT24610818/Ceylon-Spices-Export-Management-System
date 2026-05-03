import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { TextInput as PaperTextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AddProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [availability, setAvailability] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/products/categories/all');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to load categories');
    } finally {
      setFetchingCategories(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your gallery to upload photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open gallery');
    }
  };

  const validateForm = () => {
    setError('');
    if (!name.trim()) { setError('Product name is required'); return false; }
    if (!category) { setError('Please select a category'); return false; }
    if (!quantity.trim() || isNaN(quantity) || parseInt(quantity) <= 0) { setError('Quantity must be a positive number'); return false; }
    if (!pricePerUnit.trim() || isNaN(pricePerUnit) || parseFloat(pricePerUnit) <= 0) { setError('Price must be a positive number'); return false; }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const response = await axiosInstance.post('/products', {
        name: name.trim(),
        scientificName: scientificName.trim(),
        category,
        grade: grade.trim(),
        description: description.trim(),
        quantity: parseInt(quantity),
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        availabilityStatus: availability,
      });
      const productId = response.data.data._id;

      if (image) {
        try {
          const formData = new FormData();
          const filename = image.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formData.append('image', { uri: image, name: filename, type });
          const token = await AsyncStorage.getItem('authToken');
          const apiUrl = axiosInstance.defaults.baseURL;
          const uploadUrl = `${apiUrl}/products/${productId}/upload-image`;
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
          });
          if (!uploadResponse.ok) throw new Error('Upload failed');
        } catch (imgErr) {
          Alert.alert('Partial Success', 'Product added but image upload failed.');
          navigation.goBack();
          return;
        }
      }

      Alert.alert('Success', 'Product added successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>CATALOG</Text>
          <Text style={styles.headerTitle}>ADD PRODUCT</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.85}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.imageIconCircle}>
                <MaterialIcons name="add-a-photo" size={28} color="#012d1d" />
              </View>
              <Text style={styles.imagePlaceholderText}>Tap to add product image</Text>
              <Text style={styles.imagePlaceholderSub}>JPG, PNG supported</Text>
            </View>
          )}
          {image && (
            <View style={styles.imageOverlayBadge}>
              <MaterialIcons name="edit" size={14} color="#fff" />
              <Text style={styles.imageOverlayText}>Change</Text>
            </View>
          )}
        </TouchableOpacity>

        {error ? <ErrorMessage message={error} /> : null}

        {/* Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="eco" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={name}
                onChangeText={setName}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. Ceylon Cinnamon"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Scientific Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="science" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={scientificName}
                onChangeText={setScientificName}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. Cinnamomum verum"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.chipContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => setCategory(cat._id)}
                style={[
                  styles.categoryChip,
                  category === cat._id && styles.categoryChipSelected,
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat._id && styles.categoryChipTextSelected,
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quality Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality & Pricing</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Grade</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="grade" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={grade}
                onChangeText={setGrade}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. Grade A, C5 Special"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start', paddingVertical: 10 }]}>
              <MaterialIcons name="notes" size={18} color="#012d1d" style={[styles.inputIcon, { marginTop: 12 }]} />
              <PaperTextInput
                value={description}
                onChangeText={setDescription}
                mode="flat"
                style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                contentStyle={{ textAlignVertical: 'top', paddingTop: 8 }}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="Enter product description..."
                placeholderTextColor="#b0b0b0"
                multiline
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Quantity *</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="inventory" size={18} color="#012d1d" style={styles.inputIcon} />
                <PaperTextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  mode="flat"
                  style={styles.textInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  placeholder="0"
                  placeholderTextColor="#b0b0b0"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { width: 90 }]}>
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.inputWrapper}>
                <PaperTextInput
                  value={unit}
                  onChangeText={setUnit}
                  mode="flat"
                  style={styles.textInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  placeholder="kg"
                  placeholderTextColor="#b0b0b0"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price per Unit (USD) *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="attach-money" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="0.00"
                placeholderTextColor="#b0b0b0"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Available for Sale</Text>
              <Text style={styles.switchSub}>List this product in the catalog</Text>
            </View>
            <Switch
              value={availability}
              onValueChange={setAvailability}
              color="#012d1d"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleAddProduct}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Adding Product...</Text>
          ) : (
            <>
              <MaterialIcons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Add Product</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 100,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fcf9f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#795900',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: 1,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  contentContainer: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 190,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(1, 45, 29, 0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(1, 45, 29, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#012d1d',
  },
  imagePlaceholderSub: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 4,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 45, 29, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E6E80',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.12)',
    paddingLeft: 14,
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#1a1a1a',
    height: 50,
  },
  row: {
    flexDirection: 'row',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.08)',
  },
  categoryChipSelected: {
    backgroundColor: '#012d1d',
    borderColor: '#012d1d',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6E6E80',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.08)',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#012d1d',
  },
  switchSub: {
    fontSize: 12,
    color: '#6E6E80',
    fontWeight: '500',
    marginTop: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#012d1d',
    borderRadius: 20,
    paddingVertical: 18,
    gap: 10,
    marginTop: 8,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default AddProductScreen;
