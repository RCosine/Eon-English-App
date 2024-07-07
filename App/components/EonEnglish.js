import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDocs, collection } from '@firebase/firestore';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import { db } from "../firebase";
import { ScrollView } from 'react-native-gesture-handler';


const EonEnglish = () => {
    const [imgUrls, setImgUrls] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsExist, setAnnouncementsExist] = useState(true);

    useEffect(() => {
      const fetchHome = async () => {
        try {
          const Collection = await getDocs(collection(db, "Home Page"));
          if (!Collection.empty) {
            Collection.forEach(async (doc) => {
              // Assuming 'targetDocumentId' is the ID of the document you want to enter
              if (doc.id === 'Title') {
                const subCollection = await getDocs(collection(doc.ref, 'Collection'));
                const imageUrls = await Promise.all(
                  subCollection.docs.map(async (doc) => {
                    const imageUrl = doc.data().image;
                    return await getImageDownloadUrl(imageUrl);
                  })
                );
                setImgUrls(imageUrls);
              }
              if (doc.id === 'Announcement') {
                const subCollection = await getDocs(collection(doc.ref, 'Collection'));
                try
                {
                  const announcement = subCollection.docs.map(doc => doc.data());
                  if(announcement.length === 1 && Object.keys(announcement[0]).length === 0)
                  {
                    setAnnouncementsExist(false);
                  }
                  else
                  {
                    setAnnouncements(announcement);
                    setAnnouncementsExist(true);
                  }
                } catch (error) {
                  setAnnouncementsExist(false);
                }
              }
            });
          } else {
            console.log('No documents found in the vocabSet1 collection.');
            setAnnouncementsExist(false);
          }
        } catch (error) {
          console.error('Error fetching images:', error);
          setAnnouncementsExist(false);
        }
      };
      fetchHome();
    }, []);

    const getImageDownloadUrl = async (imageUrl) => {
        try {
          const storage = getStorage();
          const storageRef = ref(storage, imageUrl);
          const downloadUrl = await getDownloadURL(storageRef);
          return downloadUrl;
        } catch (error) {
          console.error('Error getting download URL:', error);
          return '';
        }
    };

    const titleImage = imgUrls[0]

    return(
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: titleImage }} style={styles.image}/>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.announcement}>Announcement:</Text>
          {announcementsExist ? (
            announcements.map((announcement, index) => (
              <Text key={index} style={styles.text}>{announcement.announcement}</Text>
            ))
          ) : (
            <Text style={styles.noAnnouncementText}>No announcement for now</Text>
          )}
          <Text style={styles.mission}>Mission:</Text>
          <Text style={styles.text}>
            Eon English is a student led international 
            non-profit that teaches children English speaking skills 
            and cultural exchange through one-on-one lessons. We hope 
            to improve these skills through online lessons with coaches 
            of similar ages and to bridge multicultural students together.
          </Text>
        </View>
      </ScrollView>
    )
}

export default EonEnglish;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Aligns contents to the top vertically
  },
  imageContainer: {
    padding: 20, // Adjust this padding as needed
  },
  image: {
    width: width - 60, // Adjust width to be slightly smaller than screen width
    height: 190,
    resizeMode: 'cover', // Optional: Adjust the image's resizeMode
    borderRadius: 15, // Set the border radius here
  },
  textContainer: {
    alignItems: 'center',
    padding: 20,
  },
  announcement: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  noAnnouncementText: {
    fontSize: 20,
  },
  mission: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 60,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
  },
});