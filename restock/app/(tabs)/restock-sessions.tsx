import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { restockSessionsStyles } from "../../styles/components/restock-sessions";
import CustomToast from "../components/CustomToast";

// Types for our data structures
interface Product {
  id: string;
  name: string;
  quantity: number;
  supplierName: string;
  supplierEmail: string;
}

interface RestockSession {
  id: string;
  products: Product[];
  createdAt: Date;
}

interface StoredProduct {
  name: string;
  supplierName: string;
  supplierEmail: string;
  lastUsed: number;
}

interface StoredSupplier {
  name: string;
  email: string;
  lastUsed: number;
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  title?: string;
}

// Placeholder data for demonstration
const initialProducts: StoredProduct[] = [
  { name: "Organic Bananas", supplierName: "Fresh Farms Co.", supplierEmail: "orders@freshfarms.com", lastUsed: Date.now() },
  { name: "Whole Grain Bread", supplierName: "Bakery Delights", supplierEmail: "supply@bakerydelights.com", lastUsed: Date.now() - 86400000 },
  { name: "Greek Yogurt", supplierName: "Dairy Fresh", supplierEmail: "orders@dairyfresh.com", lastUsed: Date.now() - 172800000 },
  { name: "Almond Milk", supplierName: "Nutty Beverages", supplierEmail: "supply@nuttybeverages.com", lastUsed: Date.now() - 259200000 },
  { name: "Quinoa", supplierName: "Grain Masters", supplierEmail: "orders@grainmasters.com", lastUsed: Date.now() - 345600000 },
];

const initialSuppliers: StoredSupplier[] = [
  { name: "Fresh Farms Co.", email: "orders@freshfarms.com", lastUsed: Date.now() },
  { name: "Bakery Delights", email: "supply@bakerydelights.com", lastUsed: Date.now() - 86400000 },
  { name: "Dairy Fresh", email: "orders@dairyfresh.com", lastUsed: Date.now() - 172800000 },
  { name: "Nutty Beverages", email: "supply@nuttybeverages.com", lastUsed: Date.now() - 259200000 },
  { name: "Grain Masters", email: "orders@grainmasters.com", lastUsed: Date.now() - 345600000 },
];

export default function RestockSessionsScreen() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [currentSession, setCurrentSession] = useState<RestockSession | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnimation] = useState(new Animated.Value(0));
  
  // Custom toast state
  const [showTransitionToast, setShowTransitionToast] = useState(false);
  const [transitionToastData, setTransitionToastData] = useState({
    type: 'info' as const,
    title: '',
    message: '',
  });
  
  // Form state
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Database state
  const [storedProducts, setStoredProducts] = useState<StoredProduct[]>([]);
  const [storedSuppliers, setStoredSuppliers] = useState<StoredSupplier[]>([]);

  // Filtered suggestions
  const [filteredProducts, setFilteredProducts] = useState<StoredProduct[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<StoredSupplier[]>([]);

  // Load stored data on component mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const showNotification = (type: Notification['type'], message: string, title?: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      title,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Animate in
    Animated.timing(notificationAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 4000);
  };

  const removeNotification = (id: string) => {
    // Animate out
    Animated.timing(notificationAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    });
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          container: restockSessionsStyles.notificationSuccess,
          icon: restockSessionsStyles.notificationSuccessIcon,
          iconText: '✓',
        };
      case 'info':
        return {
          container: restockSessionsStyles.notificationInfo,
          icon: restockSessionsStyles.notificationInfoIcon,
          iconText: 'ℹ',
        };
      case 'warning':
        return {
          container: restockSessionsStyles.notificationWarning,
          icon: restockSessionsStyles.notificationWarningIcon,
          iconText: '⚠',
        };
      case 'error':
        return {
          container: restockSessionsStyles.notificationError,
          icon: restockSessionsStyles.notificationErrorIcon,
          iconText: '✕',
        };
    }
  };

  const loadStoredData = async () => {
    try {
      const storedProductsData = await AsyncStorage.getItem('storedProducts');
      const storedSuppliersData = await AsyncStorage.getItem('storedSuppliers');
      
      if (storedProductsData) {
        setStoredProducts(JSON.parse(storedProductsData));
      } else {
        // Initialize with placeholder data
        setStoredProducts(initialProducts);
        await AsyncStorage.setItem('storedProducts', JSON.stringify(initialProducts));
      }
      
      if (storedSuppliersData) {
        setStoredSuppliers(JSON.parse(storedSuppliersData));
      } else {
        // Initialize with placeholder data
        setStoredSuppliers(initialSuppliers);
        await AsyncStorage.setItem('storedSuppliers', JSON.stringify(initialSuppliers));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      // Fallback to initial data
      setStoredProducts(initialProducts);
      setStoredSuppliers(initialSuppliers);
    }
  };

  const saveProductToDatabase = async (product: Omit<StoredProduct, 'lastUsed'>) => {
    try {
      const newProduct: StoredProduct = {
        ...product,
        lastUsed: Date.now(),
      };
      
      // Check if product already exists
      const existingIndex = storedProducts.findIndex(
        p => p.name.toLowerCase() === product.name.toLowerCase() &&
             p.supplierName.toLowerCase() === product.supplierName.toLowerCase()
      );
      
      let updatedProducts;
      if (existingIndex >= 0) {
        // Update existing product
        updatedProducts = [...storedProducts];
        updatedProducts[existingIndex] = newProduct;
      } else {
        // Add new product
        updatedProducts = [newProduct, ...storedProducts];
      }
      
      // Sort by last used (most recent first)
      updatedProducts.sort((a, b) => b.lastUsed - a.lastUsed);
      
      setStoredProducts(updatedProducts);
      await AsyncStorage.setItem('storedProducts', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Error saving product to database:', error);
    }
  };

  const saveSupplierToDatabase = async (supplier: Omit<StoredSupplier, 'lastUsed'>) => {
    try {
      const newSupplier: StoredSupplier = {
        ...supplier,
        lastUsed: Date.now(),
      };
      
      // Check if supplier already exists
      const existingIndex = storedSuppliers.findIndex(
        s => s.name.toLowerCase() === supplier.name.toLowerCase()
      );
      
      let updatedSuppliers;
      if (existingIndex >= 0) {
        // Update existing supplier
        updatedSuppliers = [...storedSuppliers];
        updatedSuppliers[existingIndex] = newSupplier;
      } else {
        // Add new supplier
        updatedSuppliers = [newSupplier, ...storedSuppliers];
      }
      
      // Sort by last used (most recent first)
      updatedSuppliers.sort((a, b) => b.lastUsed - a.lastUsed);
      
      setStoredSuppliers(updatedSuppliers);
      await AsyncStorage.setItem('storedSuppliers', JSON.stringify(updatedSuppliers));
    } catch (error) {
      console.error('Error saving supplier to database:', error);
    }
  };

  const startNewSession = () => {
    const newSession: RestockSession = {
      id: Date.now().toString(),
      products: [],
      createdAt: new Date(),
    };
    setCurrentSession(newSession);
    setIsSessionActive(true);
    showNotification('info', 'New restock session started');
  };

  const handleProductNameChange = (text: string) => {
    setProductName(text);
    if (text.length > 0) {
      const filtered = storedProducts.filter(product =>
        product.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleSupplierNameChange = (text: string) => {
    setSupplierName(text);
    if (text.length > 0) {
      const filtered = storedSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(text.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers([]);
    }
  };

  const selectProductSuggestion = (product: StoredProduct) => {
    setProductName(product.name);
    setSupplierName(product.supplierName);
    setSupplierEmail(product.supplierEmail);
    setFilteredProducts([]);
  };

  const selectSupplierSuggestion = (supplier: StoredSupplier) => {
    setSupplierName(supplier.name);
    setSupplierEmail(supplier.email);
    setFilteredSuppliers([]);
  };

  const validateForm = () => {
    if (!productName.trim()) {
      setErrorMessage("Please enter a product name");
      return false;
    }
    if (!quantity.trim() || parseInt(quantity) <= 0) {
      setErrorMessage("Please enter a valid quantity");
      return false;
    }
    if (!supplierName.trim()) {
      setErrorMessage("Please enter a supplier name");
      return false;
    }
    if (!supplierEmail.trim() || !supplierEmail.includes("@")) {
      setErrorMessage("Please enter a valid supplier email");
      return false;
    }
    return true;
  };

  const addProduct = async () => {
    setErrorMessage("");
    
    if (!validateForm()) {
      return;
    }

    if (!currentSession) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName.trim(),
      quantity: parseInt(quantity),
      supplierName: supplierName.trim(),
      supplierEmail: supplierEmail.trim(),
    };

    const updatedSession = {
      ...currentSession,
      products: [...currentSession.products, newProduct],
    };

    setCurrentSession(updatedSession);
    
    // Save to database for future autocomplete
    await saveProductToDatabase({
      name: newProduct.name,
      supplierName: newProduct.supplierName,
      supplierEmail: newProduct.supplierEmail,
    });
    
    await saveSupplierToDatabase({
      name: newProduct.supplierName,
      email: newProduct.supplierEmail,
    });
    
    // Show success notification
    showNotification('success', `${newProduct.name} added to restock session`);
    
    // Reset form
    setProductName("");
    setQuantity("");
    setSupplierName("");
    setSupplierEmail("");
    setShowAddProductForm(false);
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setQuantity(product.quantity.toString());
    setSupplierName(product.supplierName);
    setSupplierEmail(product.supplierEmail);
    setShowEditProductForm(true);
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const saveEditedProduct = async () => {
    setErrorMessage("");
    
    if (!validateForm() || !editingProduct || !currentSession) {
      return;
    }

    const updatedProduct: Product = {
      id: editingProduct.id,
      name: productName.trim(),
      quantity: parseInt(quantity),
      supplierName: supplierName.trim(),
      supplierEmail: supplierEmail.trim(),
    };

    // Check what changed
    const changes = [];
    if (editingProduct.name !== updatedProduct.name) changes.push(`Name: "${editingProduct.name}" → "${updatedProduct.name}"`);
    if (editingProduct.quantity !== updatedProduct.quantity) changes.push(`Quantity: ${editingProduct.quantity} → ${updatedProduct.quantity}`);
    if (editingProduct.supplierName !== updatedProduct.supplierName) changes.push(`Supplier: "${editingProduct.supplierName}" → "${updatedProduct.supplierName}"`);
    if (editingProduct.supplierEmail !== updatedProduct.supplierEmail) changes.push(`Email: "${editingProduct.supplierEmail}" → "${updatedProduct.supplierEmail}"`);

    const updatedProducts = currentSession.products.map(p => 
      p.id === editingProduct.id ? updatedProduct : p
    );

    const updatedSession = {
      ...currentSession,
      products: updatedProducts,
    };

    setCurrentSession(updatedSession);
    
    // Save to database for future autocomplete
    await saveProductToDatabase({
      name: updatedProduct.name,
      supplierName: updatedProduct.supplierName,
      supplierEmail: updatedProduct.supplierEmail,
    });
    
    await saveSupplierToDatabase({
      name: updatedProduct.supplierName,
      email: updatedProduct.supplierEmail,
    });
    
    // Show changes notification
    if (changes.length > 0) {
      showNotification('info', `Updated ${updatedProduct.name}`, changes.join('\n'));
    } else {
      showNotification('warning', 'No changes made to product');
    }
    
    // Reset form
    setEditingProduct(null);
    setProductName("");
    setQuantity("");
    setSupplierName("");
    setSupplierEmail("");
    setShowEditProductForm(false);
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductName("");
    setQuantity("1");
    setSupplierName("");
    setSupplierEmail("");
    setShowEditProductForm(false);
    setErrorMessage("");
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const removeProduct = (productId: string) => {
    if (!currentSession) return;

    const productToRemove = currentSession.products.find(p => p.id === productId);
    
    Alert.alert(
      "Remove Product",
      `Are you sure you want to remove "${productToRemove?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedProducts = currentSession.products.filter(p => p.id !== productId);
            setCurrentSession({
              ...currentSession,
              products: updatedProducts,
            });
            
            showNotification('warning', `${productToRemove?.name} removed from session`);
          }
        }
      ]
    );
  };

  const finishSession = () => {
    if (!currentSession || currentSession.products.length === 0) {
      showNotification('error', 'Please add at least one product before finishing');
      return;
    }

    // Show transition toast instead of alert
    setTransitionToastData({
      type: 'info',
      title: 'Ready to generate emails?',
      message: `You have ${currentSession.products.length} products ready to send to ${new Set(currentSession.products.map(p => p.supplierName)).size} suppliers.`,
    });
    setShowTransitionToast(true);
  };

  const handleGenerateEmails = () => {
    if (!currentSession) return;

    // Show success notification
    showNotification('success', `Session completed with ${currentSession.products.length} products`);
    
    // Store session data for the emails screen
    const sessionData = {
      products: currentSession.products,
      sessionId: currentSession.id,
      createdAt: currentSession.createdAt,
    };
    
    // Store the session data in AsyncStorage for the emails screen to access
    AsyncStorage.setItem('currentEmailSession', JSON.stringify(sessionData))
      .then(() => {
        // Reset session
        setCurrentSession(null);
        setIsSessionActive(false);
        setShowAddProductForm(false);
        setShowEditProductForm(false);
        setEditingProduct(null);
        
        // Hide the transition toast
        setShowTransitionToast(false);
        
        // Navigate to the emails tab
        router.push('/(tabs)/emails');
      })
      .catch((error) => {
        console.error('Error storing session data:', error);
        showNotification('error', 'Failed to prepare email session');
      });
  };

  const handleCancelTransition = () => {
    setShowTransitionToast(false);
  };

  const incrementQuantity = () => {
    const currentQty = parseInt(quantity) || 0;
    setQuantity((currentQty + 1).toString());
  };

  const decrementQuantity = () => {
    const currentQty = parseInt(quantity) || 1;
    if (currentQty > 1) {
      setQuantity((currentQty - 1).toString());
    }
  };

  const cancelAddProduct = () => {
    setShowAddProductForm(false);
    setProductName("");
    setQuantity("1");
    setSupplierName("");
    setSupplierEmail("");
    setErrorMessage("");
    setFilteredProducts([]);
    setFilteredSuppliers([]);
  };

  const renderNotification = (notification: Notification) => {
    const styles = getNotificationStyles(notification.type);
    
    return (
      <Animated.View
        key={notification.id}
        style={[
          restockSessionsStyles.notificationContainer,
          styles.container,
          {
            transform: [{
              translateY: notificationAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              })
            }]
          }
        ]}
      >
        <View style={restockSessionsStyles.notificationContent}>
          <View style={[restockSessionsStyles.notificationIcon, styles.icon]}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
              {styles.iconText}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={restockSessionsStyles.notificationText}>
              {notification.message}
            </Text>
            {notification.title && (
              <Text style={[restockSessionsStyles.notificationText, { fontSize: 11, color: '#FFFFFF', marginTop: 1, opacity: 0.9 }]}>
                {notification.title}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={restockSessionsStyles.notificationClose}
            onPress={() => removeNotification(notification.id)}
          >
            <Text style={restockSessionsStyles.notificationCloseText}>×</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderStartSection = () => (
    <View style={restockSessionsStyles.startSection}>
      <Text style={restockSessionsStyles.startPrompt}>What do you want to restock?</Text>
      <TouchableOpacity style={restockSessionsStyles.startButton} onPress={startNewSession}>
        <Text style={restockSessionsStyles.startButtonText}>Start New Restock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddProductForm = () => (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={restockSessionsStyles.formContainer}>
        <Text style={restockSessionsStyles.formTitle}>Add Product</Text>
        
        {errorMessage ? (
          <View style={restockSessionsStyles.errorMessage}>
            <Text style={restockSessionsStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Product Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={productName}
            onChangeText={handleProductNameChange}
            placeholder="Enter product name"
            autoFocus
          />
          {filteredProducts.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredProducts.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => selectProductSuggestion(product)}
                >
                  <Text style={restockSessionsStyles.suggestionText}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Quantity to Order</Text>
          <View style={restockSessionsStyles.quantityContainer}>
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={decrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={restockSessionsStyles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={incrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={supplierName}
            onChangeText={handleSupplierNameChange}
            placeholder="Enter supplier name"
          />
          {filteredSuppliers.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredSuppliers.map((supplier, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => selectSupplierSuggestion(supplier)}
                >
                  <Text style={restockSessionsStyles.suggestionText}>{supplier.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Email *</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={supplierEmail}
            onChangeText={setSupplierEmail}
            placeholder="supplier@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={restockSessionsStyles.formButtons}>
          <TouchableOpacity style={restockSessionsStyles.cancelButton} onPress={cancelAddProduct}>
            <Text style={[restockSessionsStyles.buttonText, restockSessionsStyles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={restockSessionsStyles.saveButton} onPress={addProduct}>
            <Text style={[restockSessionsStyles.buttonText, restockSessionsStyles.saveButtonText]}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderEditProductForm = () => (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={restockSessionsStyles.formContainer}>
        <Text style={restockSessionsStyles.formTitle}>Edit Product</Text>
        
        {errorMessage ? (
          <View style={restockSessionsStyles.errorMessage}>
            <Text style={restockSessionsStyles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Product Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={productName}
            onChangeText={handleProductNameChange}
            placeholder="Enter product name"
            autoFocus
          />
          {filteredProducts.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredProducts.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => selectProductSuggestion(product)}
                >
                  <Text style={restockSessionsStyles.suggestionText}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Quantity to Order</Text>
          <View style={restockSessionsStyles.quantityContainer}>
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={decrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={restockSessionsStyles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={restockSessionsStyles.quantityButton}
              onPress={incrementQuantity}
            >
              <Text style={restockSessionsStyles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Name</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={supplierName}
            onChangeText={handleSupplierNameChange}
            placeholder="Enter supplier name"
          />
          {filteredSuppliers.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {filteredSuppliers.map((supplier, index) => (
                <TouchableOpacity
                  key={index}
                  style={restockSessionsStyles.suggestionItem}
                  onPress={() => selectSupplierSuggestion(supplier)}
                >
                  <Text style={restockSessionsStyles.suggestionText}>{supplier.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={restockSessionsStyles.inputGroup}>
          <Text style={restockSessionsStyles.inputLabel}>Supplier Email *</Text>
          <TextInput
            style={restockSessionsStyles.textInput}
            value={supplierEmail}
            onChangeText={setSupplierEmail}
            placeholder="supplier@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={restockSessionsStyles.formButtons}>
          <TouchableOpacity style={restockSessionsStyles.cancelButton} onPress={cancelEdit}>
            <Text style={[restockSessionsStyles.buttonText, restockSessionsStyles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={restockSessionsStyles.saveButton} onPress={saveEditedProduct}>
            <Text style={[restockSessionsStyles.buttonText, restockSessionsStyles.saveButtonText]}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderProductList = () => (
    <ScrollView style={restockSessionsStyles.productList} showsVerticalScrollIndicator={false}>
      {currentSession?.products.map((product) => (
        <View key={product.id} style={restockSessionsStyles.productItem}>
          <View style={restockSessionsStyles.productHeader}>
            <Text style={restockSessionsStyles.productName}>{product.name}</Text>
            <Text style={restockSessionsStyles.productQuantity}>Qty: {product.quantity}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={restockSessionsStyles.editButton}
                onPress={() => editProduct(product)}
              >
                <Text style={restockSessionsStyles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={restockSessionsStyles.deleteButton}
                onPress={() => removeProduct(product.id)}
              >
                <Text style={restockSessionsStyles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={restockSessionsStyles.productSupplier}>
            Supplier: {product.supplierName}
          </Text>
          <Text style={restockSessionsStyles.productEmail}>
            Email: {product.supplierEmail}
          </Text>
        </View>
      ))}
      
      {currentSession?.products.length === 0 && (
        <View style={restockSessionsStyles.emptyState}>
          <Text style={restockSessionsStyles.emptyStateText}>
            No products added yet. Tap "Add Product" to get started.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderSessionFlow = () => (
    <View style={restockSessionsStyles.sessionContainer}>
      <View style={restockSessionsStyles.sessionHeader}>
        <Text style={restockSessionsStyles.sessionTitle}>Restock Session</Text>
        <TouchableOpacity style={restockSessionsStyles.finishButton} onPress={finishSession}>
          <Text style={restockSessionsStyles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {currentSession && currentSession.products.length > 0 && (
        <View style={restockSessionsStyles.sessionSummary}>
          <Text style={restockSessionsStyles.summaryText}>
            {currentSession.products.length} product{currentSession.products.length !== 1 ? 's' : ''} added
          </Text>
        </View>
      )}

      {showAddProductForm ? renderAddProductForm() : 
       showEditProductForm ? renderEditProductForm() : (
        <>
          <View style={restockSessionsStyles.addProductSection}>
            <TouchableOpacity
              style={restockSessionsStyles.addProductButton}
              onPress={() => setShowAddProductForm(true)}
            >
              <Text style={restockSessionsStyles.addProductButtonText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>

          {renderProductList()}
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Notifications */}
      {notifications.map(renderNotification)}
      
      <KeyboardAvoidingView
        style={restockSessionsStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {isSessionActive ? renderSessionFlow() : renderStartSection()}
      </KeyboardAvoidingView>

      {/* Custom Transition Toast */}
      <CustomToast
        visible={showTransitionToast}
        type={transitionToastData.type}
        title={transitionToastData.title}
        message={transitionToastData.message}
        actions={[
          {
            label: 'Cancel',
            onPress: handleCancelTransition,
            primary: false,
          },
          {
            label: 'Generate Emails',
            onPress: handleGenerateEmails,
            primary: true,
          },
        ]}
        autoDismiss={false}
        onDismiss={() => setShowTransitionToast(false)}
      />
    </View>
  );
} 