'use strict';
 
//var Swiper = require('react-native-swiper');
var React = require('react-native');

var {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  ActivityIndicatorIOS,
  Image,
  Component,
  AlertIOS,
  ListView,
  ScrollView
} = React;

//Styling
var styles = StyleSheet.create({
	appBodyContainer: {
		flex: 1,
		marginBottom: 0,
	},
  	foodInfoContainer: {
		flex: 1,
  	},
  	listViewContainer: {
  		marginTop: 10,
  		marginBottom: 5,
		flex: 1,
  	},
  	listViewItemContainer: {
  		marginTop: 10,
  		marginLeft: 10,
  		marginRight: 10,
	    padding: 5,
	    flex: 1,
	    backgroundColor: '#F6F6F6',
  	},
  	postUserInformation: {
  		flex: 1,
  		flexDirection: 'row',
  	},
  	postContent: {
  		flex: 1,
  		marginTop: 10,
  	},
  	rightContainer: {
	    flex: 1,
	},
	buttonText: {
		fontSize: 18,
		color: '#48BBEC',
		alignSelf: 'center'
	},
	button: {
		height: 36,
		flex: 1,
		borderRadius: 5,
		marginBottom: 10,
		alignSelf: 'stretch',
		justifyContent: 'center'
	},
	heroFoodImageContainer: {
		flex: 1,
	},
	heroFoodImage: {
		width: 500,
		height: 200,
		alignSelf: 'stretch',
		justifyContent: 'center'
	},
	profilePic: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 5,
	},
	postImages: {
		width: 120,
		height: 80,
		marginBottom: 10,
	},
	postImagesContainer: {
		flex: 1,
		flexDirection: "row",
	},
	sectionTitle: {
		color: '#48BBEC',
		fontSize: 18,
		marginTop: 5,
		marginBottom: 10,
		marginLeft: 5,
	},
	foodName: {
		fontWeight: 'bold',
		fontSize: 20,
		marginTop: 10,
	},
	foodDescription: {
		color: '#757575',
		marginTop: 10,
	},
	foodInfoText: {
		padding: 10,
	},
	contentName: {
		marginTop: 5,
	}
});

var FoodDetail = React.createClass({
	getInitialState: function() {
		return {
			foodID: this.props.foodID,
			foodObject: new Object(),
			foodType: new Object(),
		  	foodPostDataSource: new ListView.DataSource({
		    	rowHasChanged: (row1, row2) => row1 !== row2,
		  	}),
		  	isLoading: true,
		};
	},

	componentDidMount: function() {
		this.getFoodInformation();
		this.getFoodPosts();
	},

	//https://blog.nraboy.com/2015/09/make-http-requests-in-ios-with-react-native/
	getFoodInformation: function() {
		var fetchBody = "MonAnID=" + this.state.foodID;

        fetch("http://lugagi.com/script/smartPhoneAPI/food/getFoodInfo.php", 
        		{	method: "POST",
        			body: fetchBody})
        .then((response) => response.json())
        .then((responseData) => {
        	this.setState({
        		foodObject: responseData.FoodInfo[0],
        		foodType: responseData.FoodInfo[0].LoaiMonAn[0],
        	});
        })
        .done(() => {
        	this.setState({
        		isLoading: false,
        	});
        });
	},

	getFoodPosts: function() {
		this.setState({
        		isLoading: true,
        });
		var fetchBody = "MonAnID=" + this.state.foodID;
		fetch("http://lugagi.com/script/smartPhoneAPI/post/loadFoodPost.php", {method: "POST", body: fetchBody})
        .then((response) => response.json())
        .then((responseData) => {
        	this.setState({
		      foodPostDataSource: this.state.foodPostDataSource.cloneWithRows(responseData.FoodPosts),
		    });
		    console.log(this.state.foodPostDataSource);
        })
        .done( () => {
        	this.setState({
        		isLoading: false,
        	});
        });
	},

	render: function() {
		var spinner = this.state.isLoading ?
			( <ActivityIndicatorIOS
			  hidden='true'
			  size='large'/> ) :
			( <View/>);
		var fullImageURL = "http://lugagi.com/script/timthumb.php?src=" + this.state.foodObject.ImageURL + "&w=500&h=200";
		return (
			<ScrollView style={styles.appBodyContainer}>
				<View style={styles.foodInfoContainer}>
					<View style={styles.heroFoodImageContainer}>
						<Image source={{uri: fullImageURL}}
							style={styles.heroFoodImage}/>
						{spinner}
					</View>

					<View style={styles.foodInfoText}>
						<Text style={styles.foodName}>{this.state.foodObject.MonAnName}</Text>
						<Text style={styles.foodDescription}
								numberOfLines={3}>
							{this.state.foodObject.MonAnDescription}
						</Text>
						<Text style={styles.foodDescription}>
							Loại món ăn: {this.state.foodType.LoaiMonAnDescription}
						</Text>
					</View>

				</View>

				<ListView
				    dataSource={this.state.foodPostDataSource}
				    renderRow={this.renderFoodPosts}
				    style={styles.listViewContainer}/>

				{spinner}

			</ScrollView>
		);
	},


	renderFoodPosts: function(content) {
		if (content.FoodPostTypeID == 1) {

			//Render the text content first
			var postTextContent = (<Text>{content.PostContent.TextContent}</Text>);
			//Then render all of the images
			var postImages = [];
			for (var i in content.PostContent.ImageURL) {
				var imageURL = "http://lugagi.com/script/timthumb.php?src=/postimages/" + content.PostContent.ImageURL[i] + "&w=120&h=80";
				var postImage = (<Image style={styles.postImages} source={{uri: imageURL}} />);
				postImages.push(postImage);
			}
			var postContent = (
				<View>
					{postTextContent}
					<View style={styles.postImagesContainer}>
						{postImages}
					</View>
				</View>
			);
		}
		else if (content.FoodPostTypeID == 2) {
			var recipeCookingSteps = [];

			for (var i in content.PostContent.CookingSteps) {
				var cookingStepNumber = content.PostContent.CookingSteps[i].StepNumber;
				var cookingStepText = content.PostContent.CookingSteps[i].TextContent;
				var cookingStep = cookingStepNumber + ". " + cookingStepText;
						
				var cookingStepTextContent = (<Text>{cookingStep}</Text>);
				//If there is an image, return an Image Object
				if (content.PostContent.CookingSteps[i].ImageURL) {
					var cookingStepImageURL = "http://lugagi.com/script/timthumb.php?src=/postimages/" + content.PostContent.CookingSteps[i].ImageURL + "&w=120&h=80";
					var cookingStepImage = (<Image style={styles.postImages} source={{uri: cookingStepImageURL}} />);
				}
				//If there is no image for the step, do not render anything in particular
				else {
					var cookingStepImage = (<Text/>);
				}
				
				//Final push to construct the whole cooking step (text + image), then push to the main object
				var cookingStepView = (<View>{cookingStepTextContent}{cookingStepImage}</View>);
				recipeCookingSteps.push(cookingStepView);
			}

			var postContent = (
				<View>{recipeCookingSteps}</View>
			);
		}
		return (
				<View style={styles.listViewItemContainer}>
					<View style={styles.postUserInformation}>
						<Image source={{uri: content.ProfileImageURL}}
						  		style={styles.profilePic} />
						<Text style={styles.contentName} numberOfLines={2}>{content.Username}</Text>
					</View>
					<View style={styles.postContent}>
						{postContent}
					</View>
				</View>
			);
	},

});

//Export the class and permit its use in other files
module.exports = FoodDetail;