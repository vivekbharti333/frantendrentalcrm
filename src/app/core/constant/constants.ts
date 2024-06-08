export class Constant {

    // public static Site_Url = "http://192.168.29.119:8080/rentalcrm/";
    public static Site_Url = "http://localhost:8080/rentalcrm/";


    // USER ROLE
    public static mainAdmin = 'MAINADMIN';
    public static superAdmin = 'SUPERADMIN';
    public static admin = 'ADMIN';
    public static teamLeader = 'TEAM_LEADER';
    public static saleExecutive = 'SALE_EXECUTIVE';

    //Requested For
    public static TODAY = 'TODAY';
    public static YESTERDAY = 'YESTERDAY';
    public static MONTH = 'BYDATE';
    public static CUSTOM = 'CUSTOM'

    //Service
    public static donation = 'DONATION';

    //Code
    public static SUCCESS_CODE = 200;
    public static NO_CONTENT_CODE = 204;
    public static BAD_REQUEST_CODE = 400;
    public static INVALID_TOKEN_CODE = 401;
    public static ALREADY_EXISTS = 403;
    public static INTERNAL_SERVER_ERR = 500;

}