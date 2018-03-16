pragma solidity ^0.4.18;

contract Chainlist {

    //Custom types
    struct Article {
        uint256 id;
        address seller;
        address buyer;
        string name;
        string desc;
        uint256 price;
    }
    //State variables
    mapping(uint => Article) public articles;
    uint articleCounter;
    address owner;




    //Constructor
    function Chainlist() public {
        ///sellArticle("Default Article", "This is created from the constructor", 1000000000000000000);
        owner = msg.sender;
    }

    // modifiers
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }


    //Deactivate CONTRACT
    function kill() public onlyOwner {

        selfdestruct(owner);
    }



    /*Events*/
    event LogSellerArticle(uint indexed id, address indexed _seller, string _name, uint256 _price);
    event LogBuyArticle(uint indexed _id, address indexed _seller, address indexed _buyer, string _name, uint256 _price);


    function sellArticle(string _name, string _desc, uint256 _price) public {
        articleCounter++;
        articles[articleCounter] = Article(
            articleCounter,
            msg.sender,
            0x0,
            _name,
            _desc,
            _price
        );
        LogSellerArticle(articleCounter, msg.sender, _name, _price);

    }


    function getNumberOfArticle() view public returns (uint){
        return articleCounter;
    }


    //get and return all article which are for sale
    function getgetArticlesForSale() public view returns (uint []){
        uint[] memory articleIds = new uint[](articleCounter);
        uint numberOfArticleForSale = 0;
        for (uint i = 1; i <= articleCounter; i++) {
            if (articles[i].buyer == 0x0) {
                articleIds[numberOfArticleForSale] = articles[i].id;
                numberOfArticleForSale += 1;
            }
        }
        uint[] memory forSale = new uint[](numberOfArticleForSale);
        for (uint j = 0; j < numberOfArticleForSale; j++) {
            forSale[j] = articleIds[j];
        }
        return forSale;
    }


    /*function getArticle() public view returns (address _seller, address _buyer, string _name, string _desc, uint256 _price){
        return (seller, buyer, name, desc, price);
    }*/

    function buyArticle(uint _id) payable public {

        //check at least one article is for sale
        require(articleCounter > 0);

        //Check the article exist
        require(_id > 0 && _id <= articleCounter);

        //retrieve the article
        Article storage _article = articles[_id];


        require(_article.buyer == 0x0);

        require(msg.sender != _article.seller);

        require(msg.value == _article.price);

        _article.buyer = msg.sender;

        _article.seller.transfer(msg.value);

        LogBuyArticle(articleCounter, _article.seller, _article.buyer, _article.name, _article.price);
    }


}
